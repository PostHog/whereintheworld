import React, { useState } from 'react'
import clsx from 'clsx'
import './Avatar.scss'

interface AvatarProps {
    avatarUrl: string
    className?: string
    icon?: JSX.Element
    size?: 'sm' | 'md'
    userName?: string // name of the user to use initial as image fallback
}

export function Avatar({ avatarUrl, className, icon, size, userName }: AvatarProps): JSX.Element {
    const [didImageError, setDidImageError] = useState(false)

    const remoteImage = <img className="avatar-img" src={avatarUrl} onError={() => setDidImageError(true)} />
    const fallbackImage = <div className="fallback-img">{userName ? userName[0].toUpperCase() : 'U'}</div>

    return (
        <div className={clsx('avatar', className, size)}>
            {!didImageError ? remoteImage : fallbackImage}
            {icon && <div className="icon-wrapper">{icon}</div>}
        </div>
    )
}
