import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useValues } from 'kea'
import { authLogic } from 'logics/authLogic'

export function WhoAmI(): JSX.Element | null {
    const { user } = useValues(authLogic)
    if (!user) {
        // TODO: Loading state
        return null
    }
    console.log(user)
    return (
        <div className="whoami">
            <div>
                <Avatar icon={<Flag country="ES" size={10} />} avatarUrl={user?.avatar} />
            </div>
            <div>
                {user.first_name}
                {/* {user.location && (
                    <div className="text-muted" style={{ fontSize: '0.75em' }}>
                        <b>
                            {profile.location.name}, {profile.location.country_code}
                        </b>
                    </div>
                )} */}
            </div>
            <div style={{ cursor: 'pointer', marginLeft: 16, color: 'var(--primary)' }}>
                <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
        </div>
    )
}
