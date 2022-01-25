import { kea } from 'kea'
import type { navigationLogicType } from './navigationLogicType'

export const navigationLogic = kea<navigationLogicType>({
    actions: {
        toggleSidebar: true,
    },
    reducers: {
        sidebarOpen: [
            false,
            {
                toggleSidebar: (state) => !state,
            },
        ],
    },
})
