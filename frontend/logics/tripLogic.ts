import { kea } from 'kea'
import { tripLogicType } from './tripLogicType'

export const tripLogic = kea<tripLogicType>({
    actions: {
        setOpenTripId: (tripId: number | null | 'new') => ({ tripId }),
    },
    reducers: {
        openTripId: [
            null as number | null | 'new',
            {
                setOpenTripId: (_, { tripId }) => tripId,
            },
        ],
    },
})
