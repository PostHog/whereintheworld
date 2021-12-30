import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack, faPlusCircle } from '@fortawesome/free-solid-svg-icons'
// import { LocationAvatar } from './LocationAvatar'
import { TripCard } from './TripCard'
import { Button } from './Button'
import { useActions, useValues } from 'kea'
import { tripLogic } from 'logics/tripLogic'
import { useRef } from 'react'
import { userLogic } from 'logics/userLogic'
import dayjs from 'dayjs'
import { authLogic } from 'logics/authLogic'
import { formatCity } from 'utils'

export function MainOverlay(): JSX.Element {
    const { toggleOpenTrip } = useActions(tripLogic)
    const { myTrips } = useValues(tripLogic)
    const tripListRef = useRef<HTMLDivElement>(null)
    const { users, currentDate } = useValues(userLogic)
    const { user } = useValues(authLogic)

    return (
        <div className="main-overlay">
            <div className="header">
                <h1>Where in the world</h1>
                <div className="today">
                    <h2>
                        {dayjs(currentDate).isSame(dayjs(), 'day') ? 'Today' : dayjs(currentDate).format('YYYY-MM-DD')}
                    </h2>
                    <div className="away-today">
                        {users.length === 0 && 'No one is on a trip.'}
                        {/* {users.map((user) => {
                            if (user.location.isHome) {
                                return null
                            }
                            return (
                                <LocationAvatar
                                    avatarUrl={user.avatar}
                                    country={user.location.country_code}
                                    personName={user.first_name}
                                    locationText={formatCity(user.location)}
                                />
                            )
                        })} */}
                    </div>
                </div>
            </div>
            <div className="content-wrapper">
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
                <div className="footer">
                    Home Location
                    <div>
                        <FontAwesomeIcon icon={faThumbtack} />
                        <b style={{ paddingLeft: 4 }}>{user?.home_city ? formatCity(user.home_city) : 'The World'}</b>
                    </div>
                </div>
            </div>
        </div>
    )
}
