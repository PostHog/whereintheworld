import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar/Avatar'
import { faSignOutAlt, faGlobeAmericas } from '@fortawesome/free-solid-svg-icons'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'
import { formatCity } from 'utils'

export function WhoAmI(): JSX.Element | null {
    const { user } = useValues(authLogic)
    if (!user) {
        // TODO: Nice loading state
        return null
    }

    return (
        <div className="whoami">
            <div>
                <Avatar
                    icon={
                        user.home_city ? (
                            <Flag country={user.home_city.country.code} size={10} />
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

                <div className="text-muted" style={{ fontSize: '0.75em' }}>
                    <b>{user.home_city ? formatCity(user.home_city) : 'The World'}</b>
                </div>
            </div>
            <div style={{ marginLeft: 16, color: 'var(--primary)' }}>
                <a href="/logout">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </a>
            </div>
        </div>
    )
}
