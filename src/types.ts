export interface PaginatedResponse<T> {
    results: T[]
    next?: string
    previous?: string
}

export interface TripType {
    id: number
    cityId: number
    start: string
    end: string
    userId: number
    City: CityType
    matches: TripMatchType[]
}

export interface TripMatchType {
    avatarUrl: string
    personName: string
}

export interface CityType {
    id: number
    name: string
    latitude: number
    longitude: number
    admin1_code: string // Administrative region 1 code (e.g. State/Province)
    country_code: string
    timezone: string
}

interface LocationType extends CityType {
    isHome: boolean
}

export interface UserType {
    id: number
    first_name: string
    email: string
    avatar: string
    cityId: number
    location: LocationType
}
