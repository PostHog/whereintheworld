import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

export function MainOverlay(): JSX.Element {
    return (
        <div className="main-overlay">
            <div className="header">
                <h1>Where in the world</h1>
                <div className="today">
                    <h2>Today</h2>
                </div>
            </div>
            <div className="content-wrapper">
                <div className="trips">
                    <h2>My Trips</h2>
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
