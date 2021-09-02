import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
import Flag from 'react-flagkit'
import { TripMatchType } from '../types'
import clsx from 'clsx'
import { Button } from './Button'

interface TripCardProps {
    tripMatches?: TripMatchType[]
}

export function TripCard({ tripMatches }: TripCardProps): JSX.Element {
    const highlightMatches = !!tripMatches?.length

    return (
        <div className={clsx('trip-card', { highlighted: highlightMatches })}>
            <div className="trip-card-inner">
                <div className="trip-card-header">
                    <div>Aug 25 - Aug 27</div>
                    <FontAwesomeIcon icon={faEdit} style={{ cursor: 'pointer', color: '#B3C2F2' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 8 }}>
                    <Flag country="BE" size={28} style={{ borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
                    <b>Leuven, BE</b>
                </div>
            </div>
            {highlightMatches && (
                <div className="highlighter">
                    <img
                        className="avatar-highlight"
                        src="https://ca.slack-edge.com/TSS5W8YQZ-U015X6QQN0N-b6ea1c7bb618-48"
                    />
                    <div style={{ flexGrow: 1 }}>Michael will be near you!</div>
                    <Button size="sm" styling="inverse" style={{ marginLeft: 4 }}>
                        Contact
                    </Button>
                </div>
            )}
        </div>
    )
}
