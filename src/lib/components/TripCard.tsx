import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Flag from 'react-flagkit'
import { TripType } from 'types'
import clsx from 'clsx'
// import { Button } from './Button'
import { formatCity } from 'utils'
import dayjs from 'dayjs'
import { useActions } from 'kea'
import { tripLogic } from 'logics/tripLogic'

export function TripCard({ trip }: { trip: TripType }): JSX.Element {
    const highlightMatches = false
    const { setOpenTripId } = useActions(tripLogic)

    return (
        <div className={clsx('trip-card', { highlighted: highlightMatches })}>
            <div className="trip-card-inner" onClick={() => setOpenTripId(trip.id)}>
                <div className="trip-card-header">
                    <div>
                        {dayjs(trip.start).format('MMM DD')} - {dayjs(trip.end).format('MMM DD')}
                    </div>
                    <FontAwesomeIcon icon={faEdit} style={{ color: '#B3C2F2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 8 }}>
                    <Flag
                        country={trip.city.country.code}
                        size={28}
                        style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
                    />
                    <b>{formatCity(trip.city)}</b>
                </div>
            </div>
            {/* {highlightMatches && (
                <div className="highlighter">
                    <img
                        className="avatar-highlight"
                        src="https://ca.slack-edge.com/TSS5W8YQZ-U015X6QQN0N-b6ea1c7bb618-48"
                    />
                    <div style={{ flexGrow: 1 }}>Michael will be near you!</div>
                    <Button size="sm" styling="inverse" style={{ marginLeft: 4 }}>
                        Contact
                    </Button>
                </div>
            )} */}
        </div>
    )
}
