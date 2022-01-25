import { useValues } from 'kea'
import { Button } from 'lib/components/Button'
import { tripLogic } from 'logics/tripLogic'
import React from 'react'
import { TripRow } from './TripRow'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'

export default function Trips(): JSX.Element {
    const { myTrips } = useValues(tripLogic)
    return (
        <div className="trips-scene">
            <h1 className="flex-center">
                <span style={{ flexGrow: 1 }}>My trips</span>
                <Button size="lg">
                    <FontAwesomeIcon icon={faPlusCircle} /> New trip
                </Button>
            </h1>
            <div style={{ marginBottom: 32 }}>A journey of a thousand miles begins with a single step.</div>

            {myTrips.length === 0 ? (
                "You don't have any upcoming trips. Time to add one?"
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    {myTrips.map((trip) => (
                        <TripRow key={trip.id} trip={trip} />
                    ))}
                </table>
            )}
        </div>
    )
}
