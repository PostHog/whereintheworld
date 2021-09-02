// TODO
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

export interface UserType {
    id: number
    fullName: string
    email: string
    avatar: string | null
    cityId: number
    location: CityType
}
