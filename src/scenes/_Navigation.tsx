import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import './_Navigation.scss'
import { WhoAmI } from 'lib/components/WhoAmI/WhoAmI'
import { useActions, useValues } from 'kea'
import { navigationLogic } from 'logics/navigationLogic'
import clsx from 'clsx'
import { timeofDay } from 'utils'
import { authLogic } from 'logics/authLogic'
import { urls } from 'logics/sceneLogic'

interface SidebarItemInterface {
    label: string
    destination: string
}

function SidebarItem({ label, destination }: SidebarItemInterface): JSX.Element {
    return (
        <a className="sidebar-item" href={destination}>
            {label}
        </a>
    )
}

export function Navigation(): JSX.Element {
    const { sidebarOpen } = useValues(navigationLogic)
    const { toggleSidebar } = useActions(navigationLogic)
    const { user } = useValues(authLogic)
    return (
        <>
            <div className={clsx('sidebar-overlay', sidebarOpen && 'open')} onClick={toggleSidebar} />
            <div className="top-navigation">
                <div className="nav-section menu-and-logo">
                    <span className="menu-toggle" onClick={toggleSidebar}>
                        <FontAwesomeIcon icon={faBars} />
                    </span>
                    <a href={urls.default()}>
                        <h1 className="logo-main">WITW</h1>
                    </a>
                </div>

                <div className="nav-section" style={{ justifyContent: 'flex-end' }}>
                    <WhoAmI />
                </div>
            </div>
            <div className={clsx('sidebar', sidebarOpen && 'open')}>
                <h2 style={{ marginBottom: 32 }}>
                    Good {timeofDay()}, {user.first_name}!
                </h2>
                <div>
                    <SidebarItem label="My trips" destination={urls.trips()} />
                    <SidebarItem label="My profile" destination={urls.profile()} />
                </div>
            </div>
        </>
    )
}
