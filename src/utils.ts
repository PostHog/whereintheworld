import { CityType } from './types'

export function formatCity(city: CityType): string {
    return `${city.name}, ${city.region.name}, ${city.country.code}`
}
