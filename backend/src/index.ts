import { PrismaClient } from '@prisma/client'
import express from 'express'
import path from 'path'

import { loadCities } from './controllers/cities'
import { bootstrapTeam } from './controllers/teams'
import { loadUsersFromTSV } from './controllers/users'
import { isOverlappingTrip, isValidTrip } from './controllers/trips'
import { networkInterfaces } from 'os'

const prisma = new PrismaClient()
const app = express()

// bootstrap cities
loadCities()

// bootstrap the only team
bootstrapTeam()

// bootstrap users
loadUsersFromTSV("user_bootstrap.tsv", 1);

// Webapp configs beyond here

app.use(express.json())

app.get('/trips', async (req, res) => {
    const trips = await prisma.trip.findMany()
    res.json(trips)
})

app.get('/trip/:id', async (req, res) => {
    const { id } = req.params
    const trip = await prisma.trip.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.json(trip)
})

app.post(`/trip`, async (req, res) => {
    const { user_id, country, state, city, cityID, start, end } = req.body
    const newTrip = {
        user_id: Number(user_id),
        country: country,
        state: state,
        city: city,
        cityID: Number(cityID),
        start: new Date(start),
        end: new Date(end),

    }
    if (!isValidTrip(newTrip)) {
        res.json({ error: 'end must be after start of your trip' })
        return
    }
    const scheduledTrips = await prisma.trip.findMany({
        where: { user_id: Number(user_id) },
    })
    for (let scheduledTrip of scheduledTrips) {
        // check if the about to be scheduled trip overlaps with any of the scheduled trips
        if (isOverlappingTrip(scheduledTrip, newTrip)) {
            res.json({ error: 'overlapping trip' })
            return
        }
    }
    try {
        const trip = await prisma.trip.create({
            data: newTrip,
        })
        res.json(trip)
    } catch (e) {
        console.log(e)
        res.json({ error: 'check console' })
    }
})

app.put('/trip/:id', async (req, res) => {
    const { id } = req.params
    const { userId, country, state, city, cityId, start, end } = req.body
    const scheduledTrips = await prisma.trip.findMany({
        where: { user_id: Number(userId) },
    })
    const newTrip = {
        user_id: Number(userId),
        country: country,
        state: state,
        city: city,
        cityID: Number(cityId),
        start: new Date(start),
        end: new Date(end),
    }
    if (!isValidTrip(newTrip)) {
        res.json({ error: 'end must be after start of your trip' })
        return
    }
    for (let scheduledTrip of scheduledTrips) {
        // check if the about to be scheduled trip overlaps with any of the scheduled trips
        if (isOverlappingTrip(scheduledTrip, newTrip)) {
            res.json({ error: 'overlapping trip' })
            return
        }
    }
    const trip = await prisma.trip.update({
        where: { id: Number(id) },
        data: newTrip,
    })
    res.json(trip)
})

app.delete(`/trip/:id`, async (req, res) => {
    const { id } = req.params
    try {
        const post = await prisma.trip.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(post)
    } catch (e) {
        console.log(e)
        res.json({ error: 'check console' })
    }
})

app.post(`/user`, async (req, res) => {
    const result = await prisma.user.create({
        data: {
            ...req.body,
        },
    })
    res.json(result)
})

app.get('/users/near/:id', async (req, res) => {
    const { id } = req.params
    return id
})

app.get('/users/location/:date', async (req, res) => {
    const { date } = req.params
    const users = await prisma.user.findMany()
    var locations = [] 
    for (let user of users) {
        // find trips that contain the search date
        const trip = await prisma.trip.findFirst({
            where: {
                user_id: user.id,
                start: {
                    lt: new Date(date),
                },
                end: {
                    gt: new Date(date),
                },
            },
        })
        if (trip) {
          locations[user.id] = {
            cityId: trip.cityId,
          }
    }
    return date
})

app.use(express.static(path.join(__dirname, '../../frontend/public')))

const server = app.listen(parseInt(process.env.PORT || '3001'), '0.0.0.0', () => {
    console.log('🚀 Server ready at: http://localhost:' + (process.env.PORT || 3001))
})
