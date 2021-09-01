import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// load the only team (for now)

export async function addTeam(team: any) {
	await prisma.team.create({
			data: {
					name: team.name,
					description: team.description,
			},
	})
}

export async function bootstrapTeam() {
	if ((await prisma.team.count()) > 0) {
			console.log('team already loaded - skipping')
			return
	} else {
			console.log('Bootstrapping PostHog team')
			addTeam({
					name: 'PostHog',
					description: 'PostHog is going places',
			})
	}
}
