import React from 'react'
import Slider from 'rc-slider'

export function TimeTravel(): JSX.Element {
    const { createSliderWithTooltip } = Slider

    return (
        <div className="time-travel-wrapper">
            <Slider min={0} max={20} defaultValue={3} />
        </div>
    )
}
