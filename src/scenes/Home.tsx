import React from 'react'
import GoogleMapReact from 'google-map-react'
import { MapPin } from 'lib/components/MapPin/MapPin'
import { useValues } from 'kea'
import { TimeTravel } from 'lib/components/TimeTravel/TimeTravel'
import { userLogic } from 'logics/userLogic'
import './Home.scss'

export default function Home(): JSX.Element {
    const { users, travelingAtDate } = useValues(userLogic)
    const defaultProps = {
        center: {
            lat: 51.5,
            lng: 0.0,
        },
        zoom: 1,
    }

    return (
        <div className="home-scene">
            <GoogleMapReact
                bootstrapURLKeys={{
                    // TODO: Type `window` properly
                    key: (window as any).MAPS_API_KEY,
                }}
                defaultCenter={defaultProps.center}
                defaultZoom={defaultProps.zoom}
                options={{ fullscreenControl: false }}
            >
                {users.map((user) => {
                    const travelRecord = travelingAtDate.find((item) => item.user.id === user.id)
                    const location = travelRecord ? travelRecord.trip.city.location : user.home_city?.location
                    // TODO: Handle multiple people at the same location
                    return location ? (
                        <MapPin
                            lat={location[1]}
                            lng={location[0]}
                            userName={user.first_name}
                            avatarUrl={user.avatar_url}
                            travelState={travelRecord ? 'away' : 'home'}
                            key={user.id}
                        />
                    ) : null
                })}
            </GoogleMapReact>
            <TimeTravel />
        </div>
    )
}
