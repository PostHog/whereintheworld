import React, { useState } from 'react'
import clsx from 'clsx'
import { Avatar } from '../Avatar/Avatar'
import './MapPin.scss'
import { UserType } from '~/types'
import { Popover } from 'react-tiny-popover'

interface MapPinProps {
    lat: number
    lng: number
    travelState: 'home' | 'away'
    user: UserType
}

export function MapPin({ travelState, user }: MapPinProps): JSX.Element {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    return (
        <Popover
            isOpen={isPopoverOpen}
            padding={4}
            onClickOutside={() => setIsPopoverOpen(false)}
            positions={['bottom', 'top']} // preferred positions by priority
            containerClassName="map-pin-overlay"
            content={
                <div className="">
                    <b>{user.first_name}</b>
                    <div>Traveling</div>
                    <div>Working hours</div>
                    <div>Providence, RI, USA</div>
                    <div>EST -6hr</div>
                </div>
            }
        >
            <div
                className={clsx('map-pin', travelState)}
                title={user.first_name}
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                style={{ zIndex: isPopoverOpen ? 120000 : undefined }}
            >
                <Avatar avatarUrl={user.avatar_url} userName={user.first_name} />
            </div>
        </Popover>
    )
}
