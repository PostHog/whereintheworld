import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { CityType, WorkHoursType } from './types'

dayjs.extend(utc)
dayjs.extend(timezone)

export function formatCity(city: CityType): string {
    const location = [city.name]
    if (city.country.code === 'US' && city.region?.name) {
        location.push(city.region.name)
    }
    location.push(city.country.code)

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

export function userAvailability(tz: string, work_hours?: WorkHoursType): 'available' | 'unavailable' | 'unknown' {
    if (!work_hours || !work_hours.start || !work_hours.end) {
        return 'unknown'
    }

    const startOfWorkDay = dayjs.tz(`${dayjs().format('YYYY-MM-DD')} ${work_hours.start}`, tz)
    const endOfWorkDay = dayjs.tz(`${dayjs().format('YYYY-MM-DD')} ${work_hours.end}`, tz)

    if (startOfWorkDay.hour() <= dayjs().tz(tz).hour() && endOfWorkDay.hour() > dayjs().tz(tz).hour()) {
        return 'available'
    }
    return 'unavailable'
}
