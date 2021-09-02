import { PrismaClient } from '@prisma/client'
import csv from 'csv-parser'
import fs from 'fs'

const prisma = new PrismaClient()

// load users

export async function addUser(user: any, team = 1) {
	await prisma.user.create({
			data: {
					fullName: user.full_name,
					email: user.email,
					city: user.city,
					state: user.county,
					country: user.country,
					cityId: parseInt(user.city_id),
					team: {
							connect: {
									id: team,
							},
					},
			},
	})
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