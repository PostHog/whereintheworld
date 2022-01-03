import dayjs from 'dayjs'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlaneDeparture, faPlaneArrival } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Flag from 'react-flagkit'
import { MatchType } from '~/types'
import { Avatar } from '../Avatar/Avatar'
import './MatchRecord.scss'

export function MatchRecord({ match }: { match: MatchType }): JSX.Element {
    const { user } = useValues(authLogic)
    const otherParty = match.source_user.id === user.id ? match.target_user : match.source_user
    const myRelatedTrip = match.source_user.id === user.id ? match.source_trip : match.target_trip
    const matchCity = myRelatedTrip ? myRelatedTrip.city : user.home_city

    return (
        <div className="match-record">
            <Avatar
                avatarUrl={otherParty.avatar_url}
                size="sm"
                icon={<Flag country={matchCity.country.code} size={8} />}
                userName={otherParty.first_name}
            />
            <div>
                <div>{otherParty.first_name}</div>
                <div className="dates">
                    {dayjs(match.overlap_start).format('MMM D')} - {dayjs(match.overlap_end).format('MMM D')}
                </div>
            </div>
            <div className="match-location">
                <FontAwesomeIcon icon={myRelatedTrip ? faPlaneDeparture : faPlaneArrival} style={{ marginRight: 4 }} />
                {matchCity.name}
            </div>
        </div>
    )
}
