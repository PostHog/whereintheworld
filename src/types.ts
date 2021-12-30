export interface PaginatedResponse<T> {
    results: T[]
    next?: string
    previous?: string
}

export interface TripType {
    id: number
    start: string
    end: string
    city: CityType
    user: UserType
    notes?: string // `notes` is not present when viewing others' trips
}

export interface CountryType {
    code: string
    code3: string
    name: string
    currency: string
    tld: string
    capital: string
}

export interface RegionType {
    // First-level administrative organization; e.g. states (US) or provinces (CA).
    code: string
    name: string
}

export interface CityType {
    id: number // Only `id` that is numberic
    name: string
    country: CountryType
    region: RegionType
    location: number[]
    kind: string
    timezone: string
}

export interface UserType {
    id: string
    first_name: string
    email: string
    avatar_url: string
    home_city: CityType
}
