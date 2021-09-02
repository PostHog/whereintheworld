// TODO
export interface TripType {
    destination: string
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
