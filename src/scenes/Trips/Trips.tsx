import { useValues } from 'kea'
import { tripLogic } from 'logics/tripLogic'
import React from 'react'
import { TripRow } from './TripRow'

export default function Trips(): JSX.Element {
    const { myTrips } = useValues(tripLogic)
    return (
        <div className="trips-scene">
            <h1>My trips</h1>
            <div style={{ marginBottom: 32 }}>A journey of a thousand miles begins with a single step.</div>

            {myTrips.length === 0 && "You don't have any upcoming trips. Time to add one?"}
            {myTrips.map((trip) => (
                <TripRow key={trip.id} trip={trip} />
            ))}
        </div>
    )
}
