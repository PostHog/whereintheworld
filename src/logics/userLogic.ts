import { kea } from 'kea'
import { CityType, UserTravelingType, UserType } from '../types'
import { userLogicType } from './userLogicType'
import api from 'lib/api'
import dayjs from 'dayjs'
import { authLogic } from './authLogic'

export const userLogic = kea<userLogicType>({
    actions: {
        setCurrentDate: (date: Date) => ({ date }),
    },
    connect: {
        values: [authLogic, ['user']],
    },
    reducers: {
        /** Date used for map time travelling */
        currentDate: [
            new Date(),
            {
                setCurrentDate: (_, { date }) => date,
            },
        ],
    },
    loaders: {
        users: [
            [] as UserType[],
            {
                loadUsers: async () => {
                    const response = await api.get('users')
                    return response.results as UserType[]
                },
            },
        ],
    },
    selectors: {
        travelingAtDate: [
            (s) => [s.users, s.currentDate],
            (users, currentDate): UserTravelingType[] => {
                const output: UserTravelingType[] = []
                const date = dayjs(currentDate).startOf('day')
                for (const user of users) {
                    const trip = user.trips?.find(
                        (trip) => dayjs(trip.start) <= date && dayjs(trip.end) >= date.endOf('day')
                    )
                    if (trip) {
                        output.push({ user, trip })
                    }
                }
                return output
            },
        ],
        myLocationToday: [
            (s) => [s.user, s.users],
            (user, users): CityType | null => {
                return (
                    users
                        .find((_u) => user.id === _u.id)
                        ?.trips?.find((trip) => dayjs(trip.start) <= dayjs() && dayjs(trip.end) >= dayjs().endOf('day'))
                        ?.city ||
                    user.home_city ||
                    null
                )
            },
        ],
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUsers],
    }),
})
