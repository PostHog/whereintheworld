import React, { useState } from 'react'
import clsx from 'clsx'
import { Avatar } from '../Avatar/Avatar'
import './MapPin.scss'
import { UserAtDateType } from '~/types'
import { Popover } from 'react-tiny-popover'
import { formatCity, userAvailability } from 'utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faHome, faPlane, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

// TODO: We need to replace this package as it fetches flags from a remote site
import Flag from 'react-flagkit'
import { computeMultiplePinLocation } from './mapPinUtils'

dayjs.extend(utc)
dayjs.extend(timezone)

interface MapPinProps {
    lat?: number // Used by map to position pin
    lng?: number // Used by map to position pin
    user: UserAtDateType
}

export function MapPin({ user }: MapPinProps): JSX.Element {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const availability = userAvailability(user.current_location.timezone, user.work_hours)
    const availableUntil = user.work_hours?.end
        ? dayjs
              .tz(`${dayjs().format('YYYY-MM-DD')} ${user.work_hours.end}`, user.current_location.timezone)
              .tz(dayjs.tz.guess())
        : null

    return (
        <Popover
            isOpen={isPopoverOpen}
            padding={4}
            onClickOutside={() => {
                setIsPopoverOpen(false)
            }}
            positions={['bottom', 'top']} // preferred positions by priority
            containerClassName={clsx('map-pin-overlay', availability)}
            content={
                <div className="">
                    <b>{user.first_name}</b>
                    <div className="flex-center">
                        {user.travelling ? (
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
                        {availability === 'unknown' ? (
                            <>
                                <FontAwesomeIcon icon={faQuestionCircle} style={{ marginRight: 4 }} /> Unknown
                                availability
                            </>
                        ) : (
                            <>
                                <span className={clsx('online-indicator', availability)} />
                                {availability === 'available' ? (
                                    <>
                                        Available
                                        {availableUntil
                                            ? ` until ${availableUntil.format('ha')}${
                                                  availableUntil.day() > dayjs().day() ? ' (+1)' : ''
                                              }`
                                            : ''}
                                    </>
                                ) : (
                                    'Out of working hours'
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex-center">
                        <Flag country={user.current_location.country.code} size={16} style={{ marginRight: 2 }} />
                        {formatCity(user.current_location)}
                    </div>
                    <div className="flex-center">
                        <FontAwesomeIcon icon={faClock} /> {user.current_location.timezone}
                    </div>
                </div>
            }
        >
            <div
                className={clsx(availability, 'map-pin')}
                title={user.first_name}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsPopoverOpen(!isPopoverOpen)
                }}
                style={{ zIndex: isPopoverOpen ? 120000 : undefined }}
            >
                <Avatar avatarUrl={user.avatar_url} userName={user.first_name} />
            </div>
        </Popover>
    )
}

interface MultipleMapPinProps {
    lat: number
    lng: number
    users: UserAtDateType[]
}

export function MultipleMapPin({ users }: MultipleMapPinProps): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    if (isExpanded) {
        return (
            <div onClick={() => setIsExpanded(false)} className="multiple-map-pin-container">
                <div>
                    <div
                        className={clsx('multiple-map-pin', 'expanded')}
                        title={`${users.length} teammates in this location`}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {users.length}
                    </div>
                    {users.map((user, index) => {
                        const { cx, cy, size } = computeMultiplePinLocation(users.length, index)
                        return (
                            <div
                                key={index}
                                className={clsx('map-pin', 'map-pin-multiple', user.travelling ? 'home' : 'away')}
                                title={user.first_name}
                                style={{ transform: `translate(${cx}px, ${cy}px)`, width: size, height: size }}
                            >
                                {user.current_location && <MapPin user={user} />}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    return (
        <div
            className={clsx('multiple-map-pin')}
            title={`${users.length} teammates in this location`}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            {users.length}
        </div>
    )
}
