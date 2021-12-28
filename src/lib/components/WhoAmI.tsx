import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import { useState } from 'react'
import { API } from 'const'

export function WhoAmI(): JSX.Element | null {
    const [profile, setProfile] = useState(false as any)
    useEffect(() => {
        ;(async () => {
            setProfile(await (await fetch(`${API}/profile`, { credentials: 'include' })).json())
        })()
    }, [])
    return profile === false ? null : (
        <div className="whoami">
            <div>
                <Avatar icon={<Flag country="ES" size={10} />} avatarUrl={(profile as any).picture} />
            </div>
            <div>
                {profile.name}
                {profile.location && (
                    <div className="text-muted" style={{ fontSize: '0.75em' }}>
                        <b>
                            {profile.location.name}, {profile.location.country_code}
                        </b>
                    </div>
                )}
            </div>
            <div style={{ cursor: 'pointer', marginLeft: 16, color: 'var(--primary)' }}>
                <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
        </div>
    )
}
