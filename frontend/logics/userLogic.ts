import dayjs from 'dayjs'
import { kea } from 'kea'
import { API } from '../pages/_app'
import { UserType } from '../types'
import { userLogicType } from './userLogicType'

export const userLogic = kea<userLogicType>({
    loaders: {
        users: [
            [] as UserType[],
            {
                loadUsers: async (date: string = '') => {
                    const parsedDate = dayjs(date || new Date()).format('YYYY-MM-DD')
                    const response = await (await fetch(`${API}/users/location/${parsedDate}`, {
                        credentials: 'include'
                    })).json()
                    return response as UserType[]
                },
            },
        ],
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUsers],
    }),
})
