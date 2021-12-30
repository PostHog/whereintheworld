import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'
import { formatCity } from 'utils'

export function WhoAmI(): JSX.Element | null {
    const { user } = useValues(authLogic)
    if (!user) {
        // TODO: Loading state
        return null
    }

    return (
        <div className="whoami">
            <div>
                <Avatar
                    icon={user.home_city ? <Flag country={user.home_city.country.code} size={10} /> : <></>}
                    avatarUrl={user.avatar_url}
                />
            </div>
            <div>
                {user.first_name}
                {user.home_city && (
                    <div className="text-muted" style={{ fontSize: '0.75em' }}>
                        <b>{formatCity(user.home_city)}</b>
                    </div>
                )}
            </div>
            <div style={{ marginLeft: 16, color: 'var(--primary)' }}>
                <a href="/logout">
                    <FontAwesomeIcon icon={faSignOutAlt} />
                </a>
            </div>
        </div>
    )
}
