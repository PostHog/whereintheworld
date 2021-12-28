import React from 'react'
import Slider, { Handle, SliderTooltip } from 'rc-slider'
import { userLogic } from 'logics/userLogic'
import { useActions } from 'kea'
import dayjs from 'dayjs'

// TODO: Type props properly
const handle = (props: any) => {
    const { value, dragging, index, ...restProps } = props
    return (
        <SliderTooltip
            prefixCls="rc-slider-tooltip"
            overlay={`${dayjs().add(value, 'days').format('YYYY-MM-DD')} `}
            visible={true}
            placement="top"
            defaultVisible={true}
            key={index}
        >
            <Handle value={value} {...restProps} />
        </SliderTooltip>
    )
}

export function TimeTravel(): JSX.Element {
    const { setCurrentDate } = useActions(userLogic)

    return (
        <div className="time-travel-wrapper">
            <Slider
                min={0}
                max={180}
                defaultValue={0}
                handle={handle}
                onChange={(value) => setCurrentDate(dayjs().add(value, 'days').toDate())}
            />
        </div>
    )
}
