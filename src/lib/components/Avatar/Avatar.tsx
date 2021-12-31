import React, { useState } from 'react'
import clsx from 'clsx'
import './Avatar.scss'

interface AvatarProps {
    avatarUrl: string
    className?: string
    icon?: JSX.Element
}

export function Avatar({ avatarUrl, className, icon }: AvatarProps): JSX.Element {
    const [didImageError, setDidImageError] = useState(false)

    const remoteImage = <img className="avatar-img" src={avatarUrl} onError={() => setDidImageError(true)} />
    const fallbackImage = <div className="fallback-img">U</div>

    return (
        <div className={clsx('avatar', className)}>
            {!didImageError ? remoteImage : fallbackImage}
            <div className="icon-wrapper">{icon}</div>
        </div>
    )
}
