import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlane } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import clsx from 'clsx'
import { Avatar } from './Avatar/Avatar'

interface MapPinProps {
    lat: number
    lng: number
    avatarUrl: string
    travelState: 'home' | 'away'
}

export function MapPin({ avatarUrl, travelState }: MapPinProps): JSX.Element {
    return (
        <div className={clsx('map-pin', travelState)}>
            <Avatar avatarUrl={avatarUrl} icon={<FontAwesomeIcon icon={travelState === 'home' ? faHome : faPlane} />} />
        </div>
    )
}
