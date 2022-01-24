import React from 'react'
import GoogleMapReact from 'google-map-react'
import { MapPin } from 'lib/components/MapPin/MapPin'
import { useValues } from 'kea'
import { TimeTravel } from 'lib/components/TimeTravel/TimeTravel'
import { userLogic } from 'logics/userLogic'
import './Home.scss'
import { WhoAmI } from 'lib/components/WhoAmI/WhoAmI'
import { authLogic } from 'logics/authLogic'
import { timeofDay } from 'utils'
import { matchLogic } from 'logics/matchLogic'
import { MatchRecord } from 'lib/components/MatchRecord/MatchRecord'

export default function Home(): JSX.Element {
    const { users, travelingAtDate } = useValues(userLogic)
    const { user } = useValues(authLogic)
    const { matches } = useValues(matchLogic)
    const defaultProps = {
        center: {
            lat: 51.5,
            lng: 0.0,
        },
        zoom: 1,
    }

    return (
        <div className="home-scene main-layout">
            <div className="main-section lhs">
                <h1>Where in the world</h1>
                <div>Meet up with your team in real life.</div>
                <div className="map-wrapper">
                    <div className="map-container">
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
                                const location = travelRecord
                                    ? travelRecord.trip.city.location
                                    : user.home_city?.location
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
                    </div>
                    <TimeTravel />
                </div>
                <WhoAmI />
            </div>
            <div className="main-section rhs">
                <h1>
                    Good {timeofDay()}, {user.first_name}
                </h1>

                <h2>Meet up opportunities</h2>
                <div>These teammates will be within 200km of you.</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {matches.length === 0 ? (
                        <div></div>
                    ) : (
                        matches.map((match) => <MatchRecord match={match} key={match.id} />)
                    )}
                </div>
            </div>
        </div>
    )
}
