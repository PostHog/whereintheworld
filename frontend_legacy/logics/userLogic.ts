import dayjs from 'dayjs'
import { kea } from 'kea'
import { API } from '../pages/_app'
import { UserType } from '../types'
import { userLogicType } from './userLogicType'

let cache = {}

export const userLogic = kea<userLogicType>({
    actions: {
        setCurrentDate: (date: Date) => ({date})
    },
    reducers: {
        currentDate: [
            new Date(),
            {
                setCurrentDate: (_, {date}) => date
            }
        ]
    },
    loaders: {
        users: [
            [] as UserType[],
            {
                loadUsers: async (date: string = '') => {
                    const parsedDate = dayjs(date || new Date()).format('YYYY-MM-DD')
                    if(cache[parsedDate]) {
                        return cache[parsedDate]
                    }
                    const response = await (await fetch(`${API}/users/location/${parsedDate}`, {
                        credentials: 'include'
                    })).json()
                    cache[parsedDate] = response
                    return response as UserType[]
                },
            },
        ],
    },
    listeners: ({actions}) => ({
        setCurrentDate: ({date}) => {
            actions.loadUsers(date)
        }
    }),
    events: ({ actions }) => ({
        afterMount: [actions.loadUsers],
    }),
})
