import dayjs from 'dayjs'
import { CityType } from './types'

export function formatCity(city: CityType): string {
    const location = [city.name, city.region?.name, city.country.code]
    return location.join(', ')
}

export function timeofDay(date: dayjs.Dayjs = dayjs()): string {
    const hour = date.hour()
    if (hour < 4) {
        return 'night'
    } else if (hour < 12) {
        return 'morning'
    } else if (hour < 16) {
        return 'afternoon'
    } else if (hour < 20) {
        return 'evening'
    }
    return 'night'
}
