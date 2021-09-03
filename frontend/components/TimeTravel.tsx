import React from 'react'
import Slider, { Handle, SliderTooltip } from 'rc-slider'
import { userLogic } from '../logics/userLogic'
import { useActions } from 'kea'
import dayjs from 'dayjs'

const handle = props => {
    const { value, dragging, index, ...restProps } = props;
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
    );
  };

export function TimeTravel(): JSX.Element {
    const { createSliderWithTooltip } = Slider
    const { loadUsers } = useActions(userLogic)

    return (
        <div className="time-travel-wrapper">
            <Slider
                min={0}
                max={20}
                defaultValue={0}
                handle={handle} 
                onChange={(value) => loadUsers(dayjs().add(value, 'days'))}/>
        </div>
    )
}
