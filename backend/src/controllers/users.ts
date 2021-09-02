import { PrismaClient } from '@prisma/client'
import csv from 'csv-parser'
import fs from 'fs'
import internal from 'stream'
import { parseIntNullable } from './utils'

const prisma = new PrismaClient()

// load users

export async function addUser(user: any, team = 1) {
    try {
        await prisma.user.create({
            data: {
                fullName: user.full_name,
                email: user.email,
                City: {
                    connect: {
                        id: Number(user.city_id),
                    },
                },
                team: {
                    connect: {
                        id: team,
                    },
                },
            },
        })
    } catch (e) {
        console.log(e)
        console.log(user)
    }
}

export async function loadUsersFromTSV(usersTSV = 'user_bootstrap.tsv', team = 1) {
    if ((await prisma.user.count()) > 0) {
        console.log('users already loaded - skipping')
        return
    } else {
        fs.createReadStream(usersTSV)
            .pipe(csv({ separator: '\t' }))
            .on('data', (row) => {
                addUser(row, team)
            })
            .on('end', () => {
                console.log('users file successfully processed and loaded into db')
            })
    }
}

export async function userLocationForDay(userId: number, date: Date) {
    const trip = prisma.trip.findFirst({
        where: {
            userId: userId,

            start: {
                lt: date,
            },
            end: {
                gt: date,
            },
        },
				include: {
					City: true
				}
    }).City
		if (trip) {
    	return trip
		}
		const home = prisma.user.findUnique({
			where: {id: userId},
			include: {City: true}
		}).City
}
