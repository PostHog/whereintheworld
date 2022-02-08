import { kea } from 'kea'
import { router } from 'kea-router'
import api from 'lib/api'
import { UserType, WorkHoursType } from '~/types'
import type { authLogicType } from './authLogicType'
import posthog from 'posthog-js'
import { urls } from './sceneLogic'
import { toast } from 'react-toastify'

const ENV = window.location.href.indexOf('localhost') >= 0 ? 'development' : 'production'

export interface UserUpdatePayload {
    home_city?: number
    work_hours?: WorkHoursType
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
            if (router.values.location.pathname === urls.welcome()) {
                window.location.href = '/'
            }
            toast.success('Your preferences have been saved!')
        },
        loadUserSuccess: async ({ user }) => {
            if (user && !user.home_city) {
                router.actions.push('/welcome')
            }
            posthog.identify(user.id, { email: ENV === 'production' ? user.email : `dev_${user.email}`, env: ENV })
            posthog.register({ env: ENV })
        },
    },
    events: ({ actions }) => ({
        afterMount: [actions.loadUser],
    }),
})
