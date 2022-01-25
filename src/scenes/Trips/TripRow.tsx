import dayjs from 'dayjs'
import React from 'react'
import Flag from 'react-flagkit'
import { TripType } from '~/types'
import { formatCity } from 'utils'
import './TripRow.scss'

export function TripRow({ trip }: { trip: TripType }): JSX.Element {
    return (
        <div className="trip-row">
            <div className="col" style={{ flexGrow: 'unset' }}>
                <Flag
                    country={trip.city.country.code}
                    size={32}
                    style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
                />
            </div>
            <div className="col" style={{ textAlign: 'left', flexGrow: 20 }}>
                {formatCity(trip.city)}
            </div>
            <div className="col" style={{ flexGrow: 4 }}>
                {dayjs(trip.start).format('MMM DD')} - {dayjs(trip.end).format('MMM DD')}
            </div>
            <div className="col" style={{ flexGrow: 2 }}>
                <span className="btn-link">Delete</span>
            </div>
        </div>
    )
}
