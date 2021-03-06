import clsx from 'clsx'
import dayjs from 'dayjs'
import { useActions, useValues } from 'kea'
import { Avatar } from 'lib/components/Avatar/Avatar'
import { Button } from 'lib/components/Button'
import { CitySelector } from 'lib/components/CitySelector'
import { FlagAvatar } from 'lib/components/Flags/FlagAvatar'
import { authLogic } from 'logics/authLogic'
import React, { useEffect, useState } from 'react'
import { CityType, WorkHoursType } from '~/types'
import './Profile.scss'

const TIME_REGEX = /^[0-2][0-9]:[0-5][0-9]$/

interface FormInterface {
    home_city?: CityType
    work_hours: WorkHoursType
}

// TODO: Move to react-hook-form or something more scalable and less convoluted
interface ControlInterface {
    invalid: boolean
    errorMessage: string
}

const validateStartEndTime = (start: string, end: string): boolean => {
    const [startHour, startMin] = start.split(':')
    const [endHour, endMin] = end.split(':')
    if (
        dayjs().hour(parseInt(startHour)).minute(parseInt(startMin)) <=
        dayjs().hour(parseInt(endHour)).minute(parseInt(endMin))
    ) {
        return true
    }
    return false
}

export default function Profile(): JSX.Element {
    const { user, userLoading } = useValues(authLogic)
    const [formValues, setFormValues] = useState({ work_hours: { start: '', end: '' } } as FormInterface)
    const [controlsState, setControlsState] = useState({ start: {}, end: {}, work_hours: {} } as Record<
        'start' | 'end' | 'work_hours',
        ControlInterface
    >)
    const [formState, setFormState] = useState('untouched' as 'untouched' | 'submitted')
    const { updateUser } = useActions(authLogic)
    const workingHoursError = Object.values(controlsState).find((i) => !!i.errorMessage)?.errorMessage
    const isFormValid = !Object.values(controlsState).filter((val) => val.invalid).length

    const handleWorkHourChange = (attr: 'start' | 'end', value: string): void => {
        const _controlsState = { ...controlsState }
        const _formValues = { ...formValues, work_hours: { ...formValues.work_hours, [attr]: value } }
        setFormValues(_formValues)

        if (value && !TIME_REGEX.test(value)) {
            _controlsState[attr] = { errorMessage: `Please enter a valid ${attr} time (00:00)`, invalid: true }
        } else {
            _controlsState[attr] = { errorMessage: '', invalid: false }

            // Now validate that start time is before than end time
            if (
                _formValues.work_hours.start &&
                _formValues.work_hours.end &&
                !validateStartEndTime(_formValues.work_hours.start, _formValues.work_hours.end)
            ) {
                _controlsState.work_hours = { errorMessage: 'End time must be after start time', invalid: true }
            } else {
                _controlsState.work_hours = { errorMessage: '', invalid: false }
            }
        }
        setControlsState(_controlsState)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormState('submitted')

        if (!isFormValid) {
            return
        }

        updateUser({ home_city: formValues.home_city?.id, work_hours: formValues.work_hours })
        setFormState('untouched')
    }

    useEffect(() => {
        setFormValues({ home_city: user.home_city, work_hours: user.work_hours ?? { start: '', end: '' } })
    }, [user])

    return (
        <div className="scene profile-scene">
            <h1 className="flex-center">My profile</h1>
            <div style={{ marginBottom: 32 }}>Set your preferences and profile here.</div>
            <div className="grid" style={{ maxWidth: 1080, margin: '0 auto' }}>
                <div className="col-12">
                    <div className="card" style={{ height: '100%' }}>
                        <h2>About you</h2>
                        <div className="flex-center">
                            <div style={{ marginRight: 32 }}>
                                <Avatar avatarUrl={user.avatar_url} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <div className="form-group">
                                    <label>Your name</label>
                                    <input type="text" disabled value={user.first_name} />
                                </div>
                                <div className="form-group">
                                    <label>Your email</label>
                                    <input type="text" value={user.email} disabled />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="card" style={{ height: '100%' }}>
                        <h2>Your work preferences</h2>
                        <div className="flex-center">
                            <div style={{ marginRight: 32 }}>
                                <FlagAvatar country={user.home_city?.country.code} />
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label>Your home city</label>
                                        <CitySelector
                                            onValueSelect={(city) =>
                                                city && setFormValues({ ...formValues, home_city: city })
                                            }
                                            autoFocus
                                            value={formValues.home_city}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Your usual work hours</label>
                                        <div className="help-text">
                                            This will display your availability in the world map.
                                        </div>
                                        <div className="flex-center">
                                            <input
                                                placeholder="08:00"
                                                value={formValues.work_hours.start}
                                                onChange={(e) => handleWorkHourChange('start', e.target.value)}
                                                className={clsx(
                                                    formState === 'submitted' &&
                                                        controlsState.start.invalid &&
                                                        'errored'
                                                )}
                                            />
                                            <span style={{ marginRight: 8, marginLeft: 8 }}>to</span>
                                            <input
                                                type="text"
                                                placeholder="17:00"
                                                value={formValues.work_hours.end}
                                                onChange={(e) => handleWorkHourChange('end', e.target.value)}
                                                className={clsx(
                                                    formState === 'submitted' && controlsState.end.invalid && 'errored'
                                                )}
                                            />
                                        </div>
                                        {workingHoursError && formState === 'submitted' && (
                                            <div className="error-text">{workingHoursError}</div>
                                        )}
                                    </div>
                                    <div>
                                        <Button
                                            type="submit"
                                            block
                                            disabled={userLoading || (formState === 'submitted' && !isFormValid)}
                                        >
                                            Save preferences
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
