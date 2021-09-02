import { PrismaClient, Trip } from '@prisma/client'

const prisma = new PrismaClient()

export function isValidTrip(trip: any) {
	if (trip.start > trip.end){
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
        (scheduledTrip.end > newTrip.start && scheduledTrip.start < newTrip.start ) ||
        // |-----NEW TRIP-----|xxx|~~~~~SCHEDULED TRIP~~~~|
        (scheduledTrip.start < newTrip.end && scheduledTrip.end > newTrip.end)
    ) {
        return true
    }
    return false
}
