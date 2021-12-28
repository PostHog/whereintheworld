import React from 'react'
import clsx from 'clsx'

interface AvatarProps {
    avatarUrl: string
    className?: string
    icon?: JSX.Element
}

export function Avatar({ avatarUrl, className, icon }: AvatarProps): JSX.Element {
    return (
        <div className={clsx('avatar', className)}>
            <img className="avatar-img" src={avatarUrl} />
            <div className="icon-wrapper">{icon}</div>
        </div>
    )
}
