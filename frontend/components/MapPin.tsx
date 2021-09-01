import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faPlane } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import clsx from 'clsx'

interface MapPinProps {
    lat: number
    lng: number
    imageUrl: string
    travelState: 'home' | 'away'
}

export function MapPin({ imageUrl, travelState }: MapPinProps): JSX.Element {
    return (
        <div className={clsx('map-pin', travelState)}>
            <img src={imageUrl} />
            <div className="icon-wrapper">
                <FontAwesomeIcon icon={travelState === 'home' ? faHome : faPlane} />
            </div>
        </div>
    )
}
