import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from '../Avatar/Avatar'
import { faGlobeAmericas } from '@fortawesome/free-solid-svg-icons'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'
import { formatCity } from 'utils'
import './WhoAmI.scss'
import { userLogic } from 'logics/userLogic'

export function WhoAmI(): JSX.Element | null {
    const { user } = useValues(authLogic)
    const { myLocationToday } = useValues(userLogic)
    if (!user) {
        // TODO: Nice loading state
        return null
    }

    return (
        <div className="whoami">
            <div>
                <Avatar
                    icon={
                        myLocationToday ? (
                            <Flag country={myLocationToday.country.code} size={10} />
                        ) : (
                            <FontAwesomeIcon
                                icon={faGlobeAmericas}
                                size="sm"
                                style={{ color: 'var(--text-default)' }}
                            />
                        )
                    }
                    avatarUrl={user.avatar_url}
                    userName={user.first_name}
                />
            </div>
            <div>
                {user.first_name}

                <div className="text-muted" style={{ fontSize: '0.85em', fontWeight: 'bold' }}>
                    <b>Today at {myLocationToday ? formatCity(myLocationToday) : 'The World'}</b>
                </div>
            </div>
            <div style={{ flexGrow: 1, textAlign: 'right' }}>
                <a style={{ color: 'white' }} href="/logout">
                    Logout
                </a>
            </div>
        </div>
    )
}
