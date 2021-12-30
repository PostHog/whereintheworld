import clsx from 'clsx'
import api from 'lib/api'
import React from 'react'
import Flag from 'react-flagkit'
// @ts-ignore
import AsyncSelect from 'react-select/async'
import { CityType, PaginatedResponse } from '~/types'
import { formatCity } from 'utils'

interface CitySelectorProps {
    onValueSelect: (city: CityType | null) => void
    errored?: boolean
}

export function CitySelector({ onValueSelect, errored }: CitySelectorProps): JSX.Element {
    // TODO: Can we do this seamlessly with Kea?
    // TODO: Debounce
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
            onChange={onValueSelect}
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
            className={clsx({ 'react-select__errored': errored })}
            classNamePrefix="react-select"
            escapeClearsValue
            isClearable
        />
    )
}
