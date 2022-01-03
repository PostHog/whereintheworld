import React from 'react'
import GoogleMapReact from 'google-map-react'
import { MapPin } from 'lib/components/MapPin'
import { MainOverlay } from 'lib/components/MainOverlay/MainOverlay'
import { TripView } from 'lib/components/TripView'
import { tripLogic } from 'logics/tripLogic'
import { useValues } from 'kea'
import clsx from 'clsx'
import { WhoAmI } from 'lib/components/WhoAmI'
import { TimeTravel } from 'lib/components/TimeTravel'
import { userLogic } from 'logics/userLogic'

{
    /* TODO: Handle no home_city properly */
}

export default function Home(): JSX.Element {
    const { openTrip } = useValues(tripLogic)
    const { users, travelingAtDate } = useValues(userLogic)
    const defaultProps = {
        center: {
            lat: 51.5,
            lng: 0.0,
        },
        zoom: 1,
    }

    return (
        <div className="map-container">
            <WhoAmI />
            <MainOverlay />
            <TimeTravel />
            <div className={clsx('trip-view-wrapper', { hidden: !openTrip })}>{openTrip && <TripView />}</div>

            <GoogleMapReact
                bootstrapURLKeys={{
                    key:
                        (typeof window !== 'undefined' &&
                            window.location.origin === 'http://localhost:8000' &&
                            'AIzaSyDOV1fvZoiOUskMxIYF8sSBNgVhoCNzxsk') ||
                        '',
                }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                //fullscreenControl={false}
                options={{ fullscreenControl: false }}
            >
                {users.map((user) => {
                    const travelRecord = travelingAtDate.find((item) => item.user.id === user.id)
                    const location = travelRecord ? travelRecord.trip.city.location : user.home_city.location
                    // TODO: Handle multiple people at the same location
                    return (
                        <MapPin
                            lat={location[1]}
                            lng={location[0]}
                            avatarUrl={user.avatar_url}
                            travelState={travelRecord ? 'away' : 'home'}
                            key={user.id}
                        />
                    )
                })}
            </GoogleMapReact>
        </div>
    )
}
