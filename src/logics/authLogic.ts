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
})
