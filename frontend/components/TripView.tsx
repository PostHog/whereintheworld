import React, { useState } from 'react'
import { useValues } from 'kea'
import { tripLogic } from '../logics/tripLogic'
import { Button } from './Button'
import AsyncSelect from 'react-select/async'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

// TODO
const CITIES = [
    {
        name: 'Copenhagen, DK',
        id: 3939,
    },
    {
        name: 'Hamburg, DE',
        id: 4343,
    },
    {
        name: 'Frankfurt, DE',
        id: 1234,
    },
    {
        name: 'Lisbon, PT',
        id: 4842,
    },
]

const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
        callback(CITIES.filter((i) => i.name.toLowerCase().includes(inputValue.toLowerCase())))
    }, 1000)
}

export function TripView(): JSX.Element | null {
    // TODO: const { openTripId } = useValues(tripLogic)
    const openTripId = 'new'
    const [destSearch, setDestSearch] = useState('')

    const handleDestSearch = (newValue: string) => {
        const inputValue = newValue.replace(/\W/g, '')
        setDestSearch(inputValue)
        return inputValue
    }

    if (!openTripId) {
        return null
    }
    return (
        <div className="trip-view">
            <h2>New Trip</h2>

            <form style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ flexGrow: 1 }}>
                    <div className="form-group">
                        <label>Destination</label>
                        <AsyncSelect
                            cacheOptions
                            loadOptions={loadOptions}
                            defaultOptions
                            onInputChange={handleDestSearch}
                            getOptionLabel={(option) => option.name}
                            getOptionValue={(option) => option.id}
                        />
                    </div>
                    <div className="form-group">
                        <label>Dates</label>
                        <input type="text" />
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
