import React, { useState } from 'react'
import clsx from 'clsx'
import { Avatar } from '../Avatar/Avatar'
import './MapPin.scss'
import { CityType, UserType } from '~/types'
import { Popover } from 'react-tiny-popover'
import { formatCity } from 'utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faHome, faPlane } from '@fortawesome/free-solid-svg-icons'
// TODO: We need to replace this package as it fetches flags from a remote site
import Flag from 'react-flagkit'

interface MapPinProps {
    lat: number // Used by map to position pin
    lng: number // Used by map to position pin
    travelState: 'home' | 'away'
    user: UserType
    city: CityType
}

export function MapPin({ travelState, user, city }: MapPinProps): JSX.Element {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const online = true
    return (
        <Popover
            isOpen={isPopoverOpen}
            padding={4}
            onClickOutside={() => setIsPopoverOpen(false)}
            positions={['bottom', 'top']} // preferred positions by priority
            containerClassName={clsx('map-pin-overlay', online && 'online')}
            content={
                <div className="">
                    <b>{user.first_name}</b>
                    <div>
                        {travelState === 'away' ? (
                            <>
                                <FontAwesomeIcon icon={faPlane} /> Traveling
                            </>
                        ) : (
                            <>
                                <FontAwesomeIcon icon={faHome} /> At home
                            </>
                        )}
                    </div>
                    <div className="flex-center">
                        <span className={clsx('online-indicator', online && 'online')} />{' '}
                        {online ? 'Available' : 'Out of working hours'}
                    </div>
                    <div className="flex-center">
                        <Flag country={city.country.code} size={16} style={{ marginRight: 2 }} />
                        {formatCity(city)}
                    </div>
                    <div>
                        <FontAwesomeIcon icon={faClock} /> {city.timezone}
                    </div>
                </div>
            }
        >
            <div
                className={clsx('map-pin', online && 'online')}
                title={user.first_name}
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                style={{ zIndex: isPopoverOpen ? 120000 : undefined }}
            >
                <Avatar avatarUrl={user.avatar_url} userName={user.first_name} />
            </div>
        </Popover>
    )
}
