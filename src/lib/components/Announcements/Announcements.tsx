import { useActions, useValues } from 'kea'
import { router } from 'kea-router'
import { authLogic } from 'logics/authLogic'
import React, { useEffect } from 'react'
import { toast, Slide } from 'react-toastify'
import './Announcements.scss'

export function Announcements(): JSX.Element {
    const { user } = useValues(authLogic)
    const { push } = useActions(router)

    useEffect(() => {
        console.log(user.work_hours)
        if (user && (!user.work_hours || !user.work_hours.start || !user.work_hours.end)) {
            toast.info(
                <div className="announcement-toast">
                    Looks like you haven't set your work hours.{' '}
                    <p>Click here to set your work hours and let your teammates know your availability.</p>
                </div>,
                {
                    toastId: 'announcement',
                    position: 'bottom-right',
                    transition: Slide,
                    delay: 1000,
                    autoClose: 12000,
                    hideProgressBar: true,
                    onClick: () => push('/profile'),
                }
            )
        }
    }, [])

    return <></>
}
