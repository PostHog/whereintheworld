import { PrismaClient } from '@prisma/client'
import express from 'express'
import path from 'path'

import { loadCities } from './controllers/cities'
import { bootstrapTeam } from './controllers/teams'
import { loadUsersFromTSV } from './controllers/users'
import { isOverlappingTrip, isValidTrip } from './controllers/trips'
const cors = require('cors')
const { auth, requiresAuth } = require('express-openid-connect')

const prisma = new PrismaClient()
const app = express()

async function bootstrap() {
    // bootstrap cities
    await loadCities()
    // bootstrap the only team
    await bootstrapTeam()
    // bootstrap users
    await loadUsersFromTSV('user_bootstrap.tsv', 1)
}

// Webapp configs beyond here

app.use(express.json())

app.use(cors())

app.get('/cities', async (req, res) => {
    var cityName = req.query.name
    if (cityName) {
        cityName = String(cityName).toLowerCase()
        const likeBit = `${cityName}%`
        const query = `SELECT * FROM "City" WHERE lower(name) like '${likeBit}';`
        console.log(query)
        const cities = await prisma.$queryRaw(query)
        res.json(cities)
    } else {
        const cities = await prisma.city.findMany()
        res.json(cities)
    }
})

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.CLIENT_SECRET,
    baseURL: 'https://whereintheworld.posthog.com',
    clientID: process.env.CLIENT_ID,
    issuerBaseURL: 'https://dev-7z1md7yt.us.auth0.com',
}

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config))

// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    res.send((req as any).oidc.isAuthenticated() ? 'Logged in' : 'Logged out')
})

app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify((req as any).oidc.user))
})

app.use(require('body-parser').urlencoded({ extended: true }))

app.get('/login', (req, res) => {
    res.send("<h2>Where in the world</h2><br/>Please log in <a href='/auth/slack'>here</a>")
})
app.get('/trips', async (req, res) => {
    const trips = await prisma.trip.findMany({
        include: { City: true },
    })
    res.json(trips)
})

app.get('/trips/:id', async (req, res) => {
    const { id } = req.params
    const trip = await prisma.trip.findUnique({
        where: {
            id: Number(id),
        },
        include: {
            City: true,
        },
    })
    res.json(trip)
})

app.post(`/trips`, async (req, res) => {
    const { optionalUserId, cityId, start, end } = req.body
    var userId = 1
    if (optionalUserId) {
        userId = Number(optionalUserId)
    }
    const newTrip = {
        start: new Date(start),
        end: new Date(end),
        City: {
            connect: {
                id: Number(cityId),
            },
        },
        User: {
            connect: {
                id: Number(userId),
            },
        },
    }
    if (!isValidTrip(newTrip)) {
        res.json({ error: 'end must be after start of your trip' })
        return
    }
    const scheduledTrips = await prisma.trip.findMany({
        where: { userId: Number(userId) },
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
    const { optionalUserId, cityId, start, end } = req.body
    var userId = 1
    if (optionalUserId) {
        userId = Number(optionalUserId)
    }
    const scheduledTrips = await prisma.trip.findMany({
        where: { userId: Number(userId) },
    })
    const newTrip = {
        start: new Date(start),
        end: new Date(end),
        City: {
            connect: {
                id: Number(cityId),
            },
        },
        User: {
            connect: {
                id: Number(userId),
            },
        },
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

app.get('/users', async (req, res) => {
    const users = await prisma.user.findMany({ include: { City: true, trips: true } })
    res.json(users)
})

app.post(`/users`, async (req, res) => {
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
                userId: user.id,
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
        res.json(locations)
    }
})

app.use(express.static(path.join(__dirname, '../../frontend/public')))

const server = app.listen(parseInt(process.env.PORT || '3001'), '0.0.0.0', async () => {
    console.log('🚀 Server ready at: http://localhost:' + (process.env.PORT || 3001))
    await bootstrap()
})
