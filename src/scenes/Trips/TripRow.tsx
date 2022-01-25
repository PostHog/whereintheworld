import dayjs from 'dayjs'
import React from 'react'
import Flag from 'react-flagkit'
import { TripType } from '~/types'
import { formatCity } from 'utils'
import './TripRow.scss'
import { useActions } from 'kea'
import { tripLogic } from 'logics/tripLogic'

export function TripRow({ trip }: { trip: TripType }): JSX.Element {
    const { deleteTrip } = useActions(tripLogic)
    return (
        <tr className="trip-row">
            <td style={{ width: 32 }}>
                <Flag
                    country={trip.city.country.code}
                    size={32}
                    style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 8 }}
                />
            </td>
            <td style={{ textAlign: 'left' }}>{formatCity(trip.city)}</td>
            <td>
                {dayjs(trip.start).format('MMM DD')} - {dayjs(trip.end).format('MMM DD')}
            </td>
            <td>
                <span className="cursor-pointer text-danger" onClick={() => deleteTrip({ id: trip.id })}>
                    Delete
                </span>
            </td>
        </tr>
    )
}
