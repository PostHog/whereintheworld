import { kea } from 'kea'
import { API } from '../pages/_app'
import { TripType } from '../types'
import { tripLogicType } from './tripLogicType'

interface TripPayload {
    destination: number
    dates: Date[]
}

export const tripLogic = kea<tripLogicType<TripPayload>>({
    actions: {
        setOpenTripId: (tripId: number | null | 'new') => ({ tripId }),
        toggleTripView: true,
        clearSavedtrip: true,
    },
    reducers: {
        openTripId: [
            null as number | null | 'new',
            {
                setOpenTripId: (_, { tripId }) => tripId,
                toggleTripView: (state) => (state ? null : 'new'),
            },
        ],
    },
    loaders: {
        savedTrip: [
            null as 'new' | 'updated' | null,
            {
                saveTrip: async (payload: TripPayload): Promise<'new' | 'updated' | null> => {
                    console.log(payload)
                    return 'new'
                },
                clearSavedtrip: async () => null,
            },
        ],
        trips: [
            [] as TripType[],
            {
                loadTrips: async () => {
                    const response = await (await fetch(`${API}/trips`)).json()
                    return response as TripType[]
                },
            },
        ],
    },
    listeners: ({ actions }) => ({
        saveTripSuccess: () => {
            actions.setOpenTripId(null)
        },
    }),
    events: ({ actions }) => ({
        afterMount: [actions.loadTrips],
    }),
})
