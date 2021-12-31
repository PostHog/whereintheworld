import { kea } from 'kea'
import { UserTravelingType, UserType } from '../types'
import { userLogicType } from './userLogicType'
import api from 'lib/api'
import dayjs from 'dayjs'

export const userLogic = kea<userLogicType>({
    actions: {
        setCurrentDate: (date: Date) => ({ date }),
    },
    reducers: {
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
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUsers],
    }),
})
