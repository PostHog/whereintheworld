import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons'
import { LocationAvatar } from '../LocationAvatar'
import { TripCard } from '../TripCard'
import { Button } from '../Button'
import { useActions, useValues } from 'kea'
import { tripLogic } from 'logics/tripLogic'
import { useRef } from 'react'
import { userLogic } from 'logics/userLogic'
import dayjs from 'dayjs'
import './MainOverlay.scss'
import { formatCity } from 'utils'

export function MainOverlay(): JSX.Element {
    const { toggleOpenTrip } = useActions(tripLogic)
    const { myTrips } = useValues(tripLogic)
    const tripListRef = useRef<HTMLDivElement>(null)
    const { currentDate, travelingAtDate } = useValues(userLogic)

    return (
        <div className="main-overlay">
            <div className="overlay-inner">
                <h1 className="text-center">Where in the world</h1>
                <div className="today">
                    <h2>
                        Traveling{' '}
                        {dayjs(currentDate).isSame(dayjs(), 'day')
                            ? 'today'
                            : `on ${dayjs(currentDate).format('YYYY-MM-DD')}`}
                    </h2>
                    <div className="away-today">
                        {travelingAtDate.length === 0 && 'Be the first to schedule a trip.'}
                        {travelingAtDate.map(({ user, trip }) => {
                            return (
                                <LocationAvatar
                                    avatarUrl={user.avatar_url}
                                    country={trip.city.country.code}
                                    personName={user.first_name}
                                    locationText={formatCity(trip.city)}
                                />
                            )
                        })}
                    </div>
                </div>

                <div className="trips" ref={tripListRef}>
                    <div className="flex-center">
                        <h2 style={{ flexGrow: 1 }}>My Trips</h2>
                        <Button onClick={toggleOpenTrip}>
                            <FontAwesomeIcon icon={faPlusCircle} /> Add a trip
                        </Button>
                    </div>
                    {myTrips.length === 0 && "You don't have any upcoming trips."}
                    {myTrips.map((trip) => (
                        <React.Fragment key={trip.id}>
                            <TripCard trip={trip} />
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    )
}
