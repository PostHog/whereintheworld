import React, { useState } from 'react'
import { useActions, useValues } from 'kea'
import { tripLogic } from '../logics/tripLogic'
import { Button } from './Button'
import AsyncSelect from 'react-select/async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import DateRangePicker from '@wojtekmaj/react-daterange-picker/dist/entry.nostyle'
import clsx from 'clsx'
import { CityType } from '../types'
import { API } from '../pages/_app'
import Flag from 'react-flagkit'

export function TripView(): JSX.Element {
    const { saveTrip } = useActions(tripLogic)
    const [destSearch, setDestSearch] = useState('')
    const [formValues, setFormValues] = useState({ dates: [new Date(), new Date()], destination: null })
    const [formState, setFormState] = useState('untouched' as 'untouched' | 'submitted')

    const handleDestSearch = (newValue: string) => {
        const inputValue = newValue.replace(
            /[^a-zA-z 0-9àèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ]/g,
            ''
        )
        setDestSearch(inputValue)
        return inputValue
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setFormState('submitted')
        if (formValues.destination && formValues.dates[0] && formValues.dates[1]) {
            saveTrip(formValues)
        }
    }

    // TODO: This should be debounced
    const loadCities = async (searchString, callback) => {
        const response = await (await fetch(`${API}/cities?name=${searchString}`)).json()
        callback(response)
    }

    const destErrored = formState === 'submitted' && !formValues.destination
    const datesErrored =
        formState === 'submitted' && (!formValues.dates?.length || !formValues.dates[0] || !formValues.dates[1])

    return (
        <div className="trip-view">
            <h2>New Trip</h2>

            <form style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }} onSubmit={handleSubmit}>
                <div style={{ flexGrow: 1 }}>
                    <div className="form-group">
                        <label htmlFor="destination">Destination</label>
                        <AsyncSelect
                            name="destination"
                            //cacheOptions
                            loadOptions={loadCities}
                            defaultOptions
                            onInputChange={handleDestSearch}
                            inputValue={destSearch}
                            onChange={(newOption: CityType) =>
                                setFormValues({ ...formValues, destination: newOption?.id || null })
                            }
                            getOptionLabel={(option: CityType) => (
                                <>
                                    <Flag size={12} country={option.country_code} style={{ marginRight: 4 }} />
                                    {`${option.name}, ${option.country_code === 'US' ? `${option.admin1_code},` : ''} ${
                                        option.country_code
                                    }`}
                                </>
                            )}
                            getOptionValue={(option: CityType) => option.id}
                            className={clsx({ 'react-select__errored': destErrored })}
                            classNamePrefix="react-select"
                            escapeClearsValue
                            isClearable
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
                            onChange={(newValue) => setFormValues({ ...formValues, dates: newValue })}
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
                    <div style={{ flexGrow: 1 }}>
                        <Button styling="link" style={{ color: 'var(--danger)' }}>
                            <FontAwesomeIcon icon={faTrash} /> Delete trip
                        </Button>
                    </div>

                    <Button type="submit" size="lg">
                        Save
                    </Button>
                </div>
            </form>
        </div>
    )
}
