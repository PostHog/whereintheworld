import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

export function WhoAmI(): JSX.Element {
    return (
        <div className="whoami">
            <div>
                <Avatar
                    icon={<Flag country="ES" size={10} />}
                    avatarUrl="https://ca.slack-edge.com/TSS5W8YQZ-UT2B67BA4-88a6594579ca-72"
                />
            </div>
            <div>
                James Greenhill
                <div className="text-muted" style={{ fontSize: '0.75em' }}>
                    <b>Barcelona, ES</b>
                </div>
            </div>
            <div style={{ cursor: 'pointer', marginLeft: 16, color: 'var(--primary)' }}>
                <FontAwesomeIcon icon={faSignOutAlt} />
            </div>
        </div>
    )
}
