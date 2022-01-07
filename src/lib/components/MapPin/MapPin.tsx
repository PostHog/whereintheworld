import React from 'react'
import clsx from 'clsx'
import { Avatar } from '../Avatar/Avatar'
import './MapPin.scss'

interface MapPinProps {
    lat: number
    lng: number
    avatarUrl: string
    travelState: 'home' | 'away'
    userName: string
}

export function MapPin({ avatarUrl, travelState, userName }: MapPinProps): JSX.Element {
    return (
        <div className={clsx('map-pin', travelState)} title={userName}>
            <Avatar avatarUrl={avatarUrl} userName={userName} />
        </div>
    )
}
