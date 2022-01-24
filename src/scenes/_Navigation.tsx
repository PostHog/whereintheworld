import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import './_Navigation.scss'
import { WhoAmI } from 'lib/components/WhoAmI/WhoAmI'

export function Navigation(): JSX.Element {
    return (
        <div className="navigation">
            <div className="nav-section">
                <span className="menu-toggle">
                    <FontAwesomeIcon icon={faBars} />
                </span>
                <h1 className="logo-main">WITW</h1>
            </div>

            <div className="nav-section" style={{ justifyContent: 'flex-end' }}>
                <WhoAmI />
            </div>
        </div>
    )
}
