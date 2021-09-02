import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { LocationAvatar } from './LocationAvatar'
import { TripCard } from './TripCard'
import { Button } from './Button'
import { useActions, useValues } from 'kea'
import { tripLogic } from '../logics/tripLogic'
import { useEffect } from 'react'
import { useRef } from 'react'
import { userLogic } from '../logics/userLogic'
import { formatCity } from '../utils'

export function MainOverlay(): JSX.Element {
    const { toggleTripView, clearSavedtrip } = useActions(tripLogic)
    const { savedTrip, trips } = useValues(tripLogic)
    const tripListRef = useRef<HTMLDivElement>(null)
    const { users } = useValues(userLogic)

    useEffect(() => {
        if (savedTrip) {
            tripListRef.current?.scrollTo({ behavior: 'smooth', top: tripListRef.current.scrollHeight })
            clearSavedtrip()
        }
    }, [savedTrip])

    return (
        <div className="main-overlay">
            <div className="header">
                <h1>Where in the world</h1>
                <div className="today">
                    <h2>Today</h2>
                    <div className="away-today">
                        {users.map((user) => {
                            if (user.location.isHome) {
                                return null
                            }
                            return (
                                <LocationAvatar
                                    avatarUrl={user.avatar}
                                    country={user.location.country_code}
                                    personName={user.fullName}
                                    locationText={formatCity(user.location)}
                                />
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className="content-wrapper">
                <div className="trips" ref={tripListRef}>
                    <div className="flex-center">
                        <h2 style={{ flexGrow: 1 }}>My Trips</h2>
                        <Button onClick={toggleTripView}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add a trip
                        </Button>
                    </div>

                    {trips.map((trip) => (
                        <React.Fragment key={trip.id}>
                            <TripCard trip={trip} />
                        </React.Fragment>
                    ))}
                </div>
                <div className="footer">
                    Home Location
                    <div>
                        <FontAwesomeIcon icon={faThumbtack} />
                        <b style={{ paddingLeft: 4 }}>Tartu, EE</b>
                    </div>
                </div>
            </div>
        </div>
    )
}
