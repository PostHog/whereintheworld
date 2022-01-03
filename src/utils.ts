import { CityType } from './types'

export function formatCity(city: CityType): string {
    const location = [city.name, city.region?.name, city.country.code]
    return location.join(', ')
}
