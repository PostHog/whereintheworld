import clsx from 'clsx'
import api from 'lib/api'
import React from 'react'
import Flag from 'react-flagkit'
// @ts-ignore
import AsyncSelect from 'react-select/async'
import { CityType, PaginatedResponse } from '~/types'
import { formatCity } from 'utils'

export function CitySelector(): JSX.Element {
    // TODO: Can we do this seamlessly with Kea?
    const loadCities = async (searchQuery: string, callback: (response: CityType[]) => void) => {
        const response = (await api.get(
            `/cities${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`
        )) as PaginatedResponse<CityType>
        callback(response.results)
    }

    return (
        <AsyncSelect
            name="destination"
            cacheOptions
            loadOptions={loadCities}
            defaultOptions
            // onInputChange={handleDestSearch}
            // inputValue={destSearch}
            //onChange={(newOption: CityType) => setFormValues({ ...formValues, destination: newOption?.id || null })}
            getOptionLabel={(option: CityType) => {
                const cityName = formatCity(option)
                return (
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }} title={cityName}>
                        <Flag size={12} country={option.country.code} style={{ marginRight: 4 }} />
                        {cityName}
                    </div>
                )
            }}
            getOptionValue={(option: CityType) => option.id}
            className={clsx({ 'react-select__errored': false })}
            classNamePrefix="react-select"
            escapeClearsValue
            isClearable
        />
    )
}
