import { kea } from 'kea'
import { TripType } from '../types'
import { tripLogicType } from './tripLogicType'

interface TripPayload {
    destination: number
    dates: Date[]
}

export const tripLogic = kea<tripLogicType<TripPayload>>({
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
    loaders: {
        savedTrip: [
            null as TripType | null,
            {
                saveTrip: async (payload: TripPayload) => {
                    console.log(payload)
                    return { destination: 'todo' }
                },
            },
        ],
    },
    listeners: ({ actions }) => ({
        saveTripSuccess: () => {
            actions.setOpenTripId(null)
        },
    }),
})
