import React, { useState } from 'react'
import { useActions } from 'kea'
import { tripLogic } from 'logics/tripLogic'
import { Button } from './Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
// @ts-ignore
import DateRangePicker from '@wojtekmaj/react-daterange-picker/dist/entry.nostyle'
import clsx from 'clsx'
import dayjs from 'dayjs'
import { CitySelector } from './CitySelector'

export function TripView(): JSX.Element {
    const { createTrip } = useActions(tripLogic)
    const [formValues, setFormValues] = useState({
        dates: [new Date(), new Date()],
        city: null as null | number,
    })

    const [formState, setFormState] = useState('untouched' as 'untouched' | 'submitted')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormState('submitted')
        if (formValues.city && formValues.dates[0] && formValues.dates[1]) {
            createTrip({
                city: formValues.city,
                start: dayjs(formValues.dates[0]).format('YYYY-MM-DD'),
                end: dayjs(formValues.dates[1]).format('YYYY-MM-DD'),
            })
        }
    }

    const destErrored = formState === 'submitted' && !formValues.city
    const datesErrored =
        formState === 'submitted' && (!formValues.dates?.length || !formValues.dates[0] || !formValues.dates[1])

    return (
        <div className="trip-view">
            <h2>New trip</h2>

            <form style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                <div style={{ flexGrow: 1 }}>
                    <div className="form-group">
                        <label htmlFor="destination">Destination</label>
                        <CitySelector
                            onValueSelect={(city) => setFormValues({ ...formValues, city: city?.id ?? null })}
                            errored={destErrored}
                        />
                        {destErrored && <div className="help-text text-danger">This field is required.</div>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="dateRange">Dates</label>
                        <DateRangePicker
                            name="dateRange"
                            calendarIcon={null}
                            disableCalendar={false}
                            value={formValues.dates}
                            clearIcon={<FontAwesomeIcon icon={faTimes} className="text-muted" />}
                            onChange={(newValue: Date[]) => setFormValues({ ...formValues, dates: newValue })}
                            rangeDivider="&nbsp;to&nbsp;"
                            format="d MMM y"
                            yearPlaceholder="YY"
                            monthPlaceholder="MM"
                            dayPlaceholder="dd"
                            className={clsx({ errored: datesErrored })}
                        />
                        {datesErrored && <div className="help-text text-danger">This field is required.</div>}
                    </div>
                </div>
                <div className="mt flex-center">
                    <Button type="submit" size="lg">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    )
}
