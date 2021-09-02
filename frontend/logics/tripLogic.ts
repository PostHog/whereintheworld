import { kea } from 'kea'
import { API } from '../pages/_app'
import { TripType } from '../types'
import { tripLogicType } from './tripLogicType'
import { userLogic } from './userLogic'

type TripPayload = Pick<TripType, 'cityId' | 'start' | 'end'>

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
    loaders: ({ values, actions }) => ({
        savedTrip: [
            null as 'new' | 'updated' | null,
            {
                saveTrip: async (payload: TripPayload): Promise<'new' | 'updated' | null> => {
                    if (values.openTripId === 'new') {
                        await fetch(`${API}/trips`, {
                            method: 'POST',
                            body: JSON.stringify(payload),
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        })
                        actions.loadTrips()
                        userLogic.actions.loadUsers()
                        return 'new'
                    }
                    return null
                },
                clearSavedtrip: async () => null,
                deleteTrip: async () => {
                    await fetch(`${API}/trips/${values.openTripId}`, {
                        method: 'DELETE',
                    })
                    actions.loadTrips()
                    userLogic.actions.loadUsers()
                    return null
                },
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
    }),
    listeners: ({ actions }) => ({
        saveTripSuccess: () => {
            actions.setOpenTripId(null)
        },
        deleteTripSuccess: () => {
            actions.setOpenTripId(null)
        },
    }),
    events: ({ actions }) => ({
        afterMount: [actions.loadTrips],
    }),
})
