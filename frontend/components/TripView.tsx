import React from 'react'
import { useValues } from 'kea'
import { tripLogic } from '../logics/tripLogic'

export function TripView(): JSX.Element | null {
    const { openTripId } = useValues(tripLogic)

    if (!openTripId) {
        return null
    }
    return <div className="trip-view">New Trip</div>
}
