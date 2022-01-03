import { kea } from 'kea'
import { router } from 'kea-router'
import api from 'lib/api'
import { UserType } from '~/types'
import type { authLogicType } from './authLogicType'

interface UserUpdatePayload {
    home_city: number
}

export const authLogic = kea<authLogicType<UserUpdatePayload>>({
    loaders: {
        user: [
            {} as UserType,
            {
                loadUser: async () => await api.get('/users/me'),
                updateUser: async (payload: UserUpdatePayload) => await api.update('/users/me', payload),
            },
        ],
    },
    listeners: {
        updateUserSuccess: async () => {
            window.location.href = '/'
        },
        loadUserSuccess: async ({ user }) => {
            if (user && !user.home_city) {
                router.actions.push('/welcome')
            }
        },
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUser],
    }),
})
