import React from 'react'
import Flag from 'react-flagkit'
import { Avatar } from './Avatar/Avatar'

interface LocationAvatarProps {
    avatarUrl: string
    country: string
    personName: string
    locationText: string
}

export function LocationAvatar({ avatarUrl, country, personName, locationText }: LocationAvatarProps): JSX.Element {
    return (
        <div className="location-avatar">
            <Avatar avatarUrl={avatarUrl} icon={<Flag country={country} size={10} />} />
            <div>
                {personName}
                <div className="location-text">{locationText}</div>
            </div>
        </div>
    )
}
