import React, { useState } from 'react'
import clsx from 'clsx'
import { Avatar } from '../Avatar/Avatar'
import './MapPin.scss'
import { CityType, UserType } from '~/types'
import { Popover } from 'react-tiny-popover'
import { formatCity, userAvailability } from 'utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faHome, faPlane, faQuestionCircle } from '@fortawesome/free-solid-svg-icons'
// TODO: We need to replace this package as it fetches flags from a remote site
import Flag from 'react-flagkit'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

interface MapPinProps {
    lat?: number // Used by map to position pin
    lng?: number // Used by map to position pin
    user: UserType
    city: CityType
    style?: Record<any, any>
}

export function MapPin({ user, city, style}: MapPinProps): JSX.Element {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const availability = userAvailability(city.timezone, user.work_hours)
    const availableUntil = user.work_hours?.end
        ? dayjs.tz(`${dayjs().format('YYYY-MM-DD')} ${user.work_hours.end}`, city.timezone).tz(dayjs.tz.guess())
        : null

    return (
        <Popover
            isOpen={isPopoverOpen}
            padding={4}
            onClickOutside={(e) => {
                e.stopPropagation()
                setIsPopoverOpen(false)
            }}
            positions={['bottom', 'top']} // preferred positions by priority
            containerClassName={clsx('map-pin-overlay', availability)}
            content={
                <div className="">
                    <b>{user.first_name}</b>
                    <div className="flex-center">
                        {user.travelRecord ? (
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
                        <Flag country={city.country.code} size={16} style={{ marginRight: 2 }} />
                        {formatCity(city)}
                    </div>
                    <div className="flex-center">
                        <FontAwesomeIcon icon={faClock} /> {city.timezone}
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
                style={{ zIndex: isPopoverOpen ? 120000 : undefined, ...style }}
            >
                <Avatar avatarUrl={user.avatar_url} userName={user.first_name} />
            </div>
        </Popover>
    )
}

interface MultipleMapPinProps {
    lat: number
    lng: number
    users: UserType[]
}

export function MultipleMapPin({ users }: MultipleMapPinProps): JSX.Element {
    const [isExpanded, setIsExpanded] = useState(false)
    if(isExpanded) {
        return <div onClick={() => setIsExpanded(false)} className="multiple-map-pin-container">
            <div>
            <div className={clsx('multiple-map-pin')} title={"oh"} onClick={() => setIsExpanded(!isExpanded)}>
                {users.length}
            </div>
            {users.map((user, index) => {
                var items = users.length; //users.length;
                var angle = Math.PI / items;
                var s = Math.sin(angle);
                var baseRadius = 33/2;
                if(items === 5) var baseRadius = 48/2;
                if(items === 6) var baseRadius = 48/2;
                if(items === 7) var baseRadius = 36;
                var r = baseRadius * s / (1-s);
                
                var startAngle = 0.0;
                var phi = Math.PI * startAngle / 180 + angle * index * 2;
                var cx = (baseRadius + r) * Math.cos(phi);
                var cy = (baseRadius + r) * Math.sin(phi);
                var size = Math.min(r*2, 60);
                
                if(items === 2) {
                    if(index == 0) {
                        cx = 25
                        cy = -30
                    }
                    if(index == 1) {
                        cx = -85
                        cy = -30
                    }
                }
                if(items === 3) {
                    if(index == 0) {
                        cx = 25
                        cy = -30
                    }
                    if(index == 1) {
                        cx = -56
                        cy = 19
                    }
                    // translate(-35.641px, 33.282px)
                    // translate(-34.641px, 23.282px)
                    if (index == 2) {
                        cx = -53
                        cy = -80
                    }
                }
                if(items === 4) {
                    cx -= 30;
                    cy -= 30;
                }
                if(items === 5) {
                    cx -= 30;
                    cy -= 30;
                }
                if(items === 6) {
                    cx -= 25;
                    cy -= 25;
                }
                if(items === 7) {
                    cx -= 25;
                    cy -= 25;
                }
                return <div key={index} className={clsx('map-pin', 'map-pin-multiple', user.travelRecord ? 'home' : 'away')} title={user.first_name} style={{'transform': `translate(${cx}px, ${cy}px)`, width: size, height: size}} >
                    {user.current_location && <MapPin user={user} city={user.current_location}  />}
                </div>
            })}
        </div>
        </div>
    }
    return (
        <div className={clsx('multiple-map-pin')} title={"oh"} onClick={() => setIsExpanded(!isExpanded)}>
            {users.length}
        </div>
    )
}