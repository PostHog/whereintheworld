import { kea } from 'kea'
import { TripType } from '../types'
import { tripLogicType } from './tripLogicType'
import api from 'lib/api'

interface TripPayload extends Pick<TripType, 'start' | 'end'> {
    city: number
}

export const tripLogic = kea<tripLogicType<TripPayload>>({
    actions: {
        toggleOpenTrip: true,
        appendTrip: (trip: TripType) => ({ trip }),
        removeTrip: (id: string) => ({ id }),
    },
    reducers: {
        openTrip: [
            false,
            {
                toggleOpenTrip: (state) => !state,
            },
        ],
        myTrips: [
            [] as TripType[],
            {
                appendTrip: (state, { trip }) => [trip, ...state],
                removeTrip: (state, { id }) => state.filter((trip) => trip.id !== id),
            },
        ],
    },
    loaders: ({ actions }) => ({
        _createdTrip: [
            null as string | null,
            {
                createTrip: async (payload: TripPayload) => {
                    const trip = await api.create('trips', payload)
                    actions.appendTrip(trip as TripType)
                    actions.toggleOpenTrip()
                    return trip.id
                },
                deleteTrip: async ({ id }: { id: string }) => {
                    await api.delete(`trips/${id}`)
                    actions.removeTrip(id)
                    return null
                },
            },
        ],
        myTrips: [
            [] as TripType[],
            {
                loadTrips: async () => {
                    const response = await api.get('trips?me=true')
                    return response.results as TripType[]
                },
            },
        ],
    }),
    events: ({ actions }) => ({
        afterMount: [actions.loadTrips],
    }),
})
