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
    lat: number // Used by map to position pin
    lng: number // Used by map to position pin
    travelState: 'home' | 'away'
    user: UserType
    city: CityType
}

export function MapPin({ travelState, user, city }: MapPinProps): JSX.Element {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const availability = userAvailability(city.timezone, user.work_hours)
    const availableUntil = user.work_hours?.end
        ? dayjs.tz(`${dayjs().format('YYYY-MM-DD')} ${user.work_hours.end}`, city.timezone).tz(dayjs.tz.guess())
        : null

    return (
        <Popover
            isOpen={isPopoverOpen}
            padding={4}
            onClickOutside={() => setIsPopoverOpen(false)}
            positions={['bottom', 'top']} // preferred positions by priority
            containerClassName={clsx('map-pin-overlay', availability)}
            content={
                <div className="">
                    <b>{user.first_name}</b>
                    <div className="flex-center">
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
                className={clsx('map-pin', availability)}
                title={user.first_name}
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                style={{ zIndex: isPopoverOpen ? 120000 : undefined }}
            >
                <Avatar avatarUrl={user.avatar_url} userName={user.first_name} />
            </div>
        </Popover>
    )
}
