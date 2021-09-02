import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'
import { LocationAvatar } from './LocationAvatar'
import { TripCard } from './TripCard'

export function MainOverlay(): JSX.Element {
    return (
        <div className="main-overlay">
            <div className="header">
                <h1>Where in the world</h1>
                <div className="today">
                    <h2>Today</h2>
                    <div className="away-today">
                        <LocationAvatar
                            avatarUrl="https://ca.slack-edge.com/TSS5W8YQZ-U01403VS4MQ-6ae8013dc1bc-72"
                            country="ES"
                            personName="James"
                            locationText="Toledo, ES"
                        />
                        <LocationAvatar
                            avatarUrl="https://ca.slack-edge.com/TSS5W8YQZ-U018VMZBKQ8-a6b4316ff00a-48"
                            country="SE"
                            personName="Yakko"
                            locationText="Stockholm, SE"
                        />
                        <LocationAvatar
                            avatarUrl="https://ca.slack-edge.com/TSS5W8YQZ-U015X6QQN0N-b6ea1c7bb618-48"
                            country="PL"
                            personName="Michał"
                            locationText="Warsaw, PL"
                        />
                        <LocationAvatar
                            avatarUrl="https://ca.slack-edge.com/TSS5W8YQZ-U01403VS4MQ-6ae8013dc1bc-72"
                            country="BR"
                            personName="Marcus"
                            locationText="São Paulo, BR"
                        />
                    </div>
                </div>
            </div>
            <div className="content-wrapper">
                <div className="trips">
                    <h2>My Trips</h2>
                    <TripCard
                        tripMatches={[
                            {
                                avatarUrl: 'https://ca.slack-edge.com/TSS5W8YQZ-U015X6QQN0N-b6ea1c7bb618-48',
                                personName: 'Michael',
                            },
                        ]}
                    />
                    <TripCard />
                    <TripCard />
                    <TripCard />
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
