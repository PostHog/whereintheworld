import { CityType } from './types'

export function formatCity(city: CityType): string {
    return `${city.name}, ${city.country_code === 'US' ? `${city.admin1_code},` : ''} ${city.country_code}`
}
