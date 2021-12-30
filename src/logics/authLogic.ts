import { kea } from 'kea'
import api from 'lib/api'
import { UserType } from '~/types'
import type { authLogicType } from './authLogicType'

export const authLogic = kea<authLogicType>({
    loaders: {
        user: [
            null as UserType | null,
            {
                loadUser: async () => await api.get('/users/me'),
            },
        ],
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUser],
    }),
    urlToAction: () => ({
        '*': (_: any, { jwt }: { jwt?: string }) => {
            if (jwt) {
                window.localStorage.setItem('token', jwt)
                window.location.reload()
            }
        },
    }),
})
