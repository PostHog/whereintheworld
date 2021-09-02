import React from 'react'
import Slider from 'rc-slider'
import { userLogic } from '../logics/userLogic'
import { useActions } from 'kea'
import dayjs from 'dayjs'

export function TimeTravel(): JSX.Element {
    const { createSliderWithTooltip } = Slider
    const { loadUsers } = useActions(userLogic)

    return (
        <div className="time-travel-wrapper">
            <Slider min={0} max={20} defaultValue={0}  onAfterChange={(value) => loadUsers(dayjs().add(value, 'days'))}/>
        </div>
    )
}
