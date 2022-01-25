import dayjs from 'dayjs'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Flag from 'react-flagkit'
import { MatchType } from '~/types'
import { Avatar } from '../Avatar/Avatar'
import './MatchRecord.scss'
import { formatCity } from 'utils'

export function MatchRecord({ match }: { match: MatchType }): JSX.Element | null {
    const { user } = useValues(authLogic)
    const otherParty = match.source_user.id === user.id ? match.target_user : match.source_user
    const myRelatedTrip = match.source_user.id === user.id ? match.source_trip : match.target_trip
    const matchCity = myRelatedTrip ? myRelatedTrip.city : user.home_city

    if (!matchCity) {
        return null
    }

    return (
        <div className="match-record">
            <Avatar
                avatarUrl={otherParty.avatar_url}
                icon={<Flag country={matchCity.country.code} size={8} />}
                userName={otherParty.first_name}
            />
            <div className="metadata">
                <div>{otherParty.first_name}</div>
                <div>{formatCity(matchCity)}</div>
                <div className="dates">
                    {dayjs(match.overlap_start).format('MMM D')} - {dayjs(match.overlap_end).format('MMM D')}
                </div>
                <div style={{ marginTop: 3 }}>
                    <a href="#">
                        Meet <FontAwesomeIcon icon={faArrowRight} />
                    </a>
                </div>
            </div>
        </div>
    )
}
