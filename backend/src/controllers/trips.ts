import haversine from 'haversine-distance'
import { City, PrismaClient, Trip } from '@prisma/client'
import { allLocationsForDay } from './users'

const prisma = new PrismaClient()

export function isValidTrip(trip: any) {
    if (trip.start > trip.end) {
        return false
    }
    return true
}

export function isOverlappingTrip(newTrip: Trip, scheduledTrip: any) {
    // check if the about to be scheduled trip overlaps with any of the scheduled trips
    if (
        // |~~~~~SCHEDULED TRIP~~~~~~~|-NEW TRIP-|~~~|
        (scheduledTrip.start <= newTrip.start && newTrip.end <= scheduledTrip.end) ||
        // |~~~~~SCHEDULED TRIP~~~~|xxx|-----NEW TRIP-----|
        (scheduledTrip.end > newTrip.start && scheduledTrip.start < newTrip.start) ||
        // |-----NEW TRIP-----|xxx|~~~~~SCHEDULED TRIP~~~~|
        (scheduledTrip.start < newTrip.end && scheduledTrip.end > newTrip.end)
    ) {
        return true
    }
    return false
}

export async function findNearbyUsers(trip, distanceThreshold = 1609.34 * 200) {
    var nearbyUsersByDate = {}
    const tripLatLon = { latitude: trip.City.latitude, longitude: trip.City.longitude }
    for (var d = trip.start; d <= trip.end; d.setDate(d.getDate() + 1)) {
        const locations = await allLocationsForDay(d)
        var nearbyUsers = []
        for (let location of locations) {
            const userLatLon = {
                latitude: location.location.latitude,
                longitude: location.location.longitude,
            }
            const userDistanceToTrip = haversine(tripLatLon, userLatLon)
            if (userDistanceToTrip > distanceThreshold) {
                nearbyUsers.push(location)
            }
        }
        nearbyUsersByDate[d.toISOString().split('T')[0]] = nearbyUsers
    }
    return nearbyUsersByDate
}
