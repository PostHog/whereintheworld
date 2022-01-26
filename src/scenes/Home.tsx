import React from 'react'
import GoogleMapReact from 'google-map-react'
import { MapPin, MultipleMapPin } from 'lib/components/MapPin/MapPin'
import { useValues } from 'kea'
import { TimeTravel } from 'lib/components/TimeTravel/TimeTravel'
import { userLogic } from 'logics/userLogic'
import './Home.scss'

export default function Home(): JSX.Element {
    // const { users, travelingAtDate } = useValues(userLogic)
    const { locationsForUsers } = useValues(userLogic)
    const defaultProps = {
        center: {
            lat: 51.5,
            lng: 0.0,
        },
        zoom: 1,
    }

    return (
        <div className="scene home-scene">
            <GoogleMapReact
                bootstrapURLKeys={{
                    // TODO: Type `window` properly
                    key: (window as any).MAPS_API_KEY,
                }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                options={{ fullscreenControl: false }}
            >
                {Object.entries(locationsForUsers).map(([_, users]) => {
                                if(users.length === 0) {
                                    return null
                                }
                                if(users.length === 1) {
                                    let user = users[0]
                                    return user.current_location ? (
                                        <MapPin
                                            lat={user.current_location.location[1]}
                                            lng={user.current_location.location[0]}
                                            city={user.current_location}
                                            user={user}
                                            key={user.id}
                                        />) : null
                                } else {
                                    let user = users[0]
                                    return user.current_location ? <MultipleMapPin
                                            lat={user.current_location.location[1]}
                                            lng={user.current_location.location[0]}
                                            users={users}
                                            key={user.id}
                                            /> : null
                                }
                            })}
            </GoogleMapReact>
            <TimeTravel />
        </div>
    )
}
