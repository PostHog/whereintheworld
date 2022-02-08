import React from 'react'
import Flag from 'react-flagkit'
import './FlagAvatar.scss'

export function FlagAvatar({ country }: { country?: string }): JSX.Element {
    return (
        <div className="flag-avatar">
            <div className="flag-container">
                <Flag country={country} size={52} />
            </div>
        </div>
    )
}
