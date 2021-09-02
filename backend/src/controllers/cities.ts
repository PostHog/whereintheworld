import { PrismaClient } from '@prisma/client'
import csv from 'csv-parser'
import fs from 'fs'
import { parseIntNullable } from './utils'

const prisma = new PrismaClient()

// Initialize city database

export async function addCity(row: any) {
    await prisma.city.create({
        data: {
            id: parseInt(row.geonameid),
            name: row.name,
            ascii_name: row.ascii_name,
            alternate_names: row.alternate_names,
            latitude: parseFloat(row.latitude),
            longitude: parseFloat(row.longitude),
            feature_class: row.feature_class,
            feature_code: row.feature_code,
            country_code: row.country_code,
            cc2: row.cc2,
            admin1_code: row.admin1_code,
            admin2_code: row.admin2_code,
            admin3_code: row.admin3_code,
            admin4_code: row.admin4_code,
            population: parseIntNullable(row.population),
            elevation: parseIntNullable(row.elevation),
            dem: parseIntNullable(row.dem),
            timezone: row.timezone,
            modification_date: new Date(row.modification_date),
        },
    })
}

export async function loadCities() {
    if ((await prisma.city.count()) > 0) {
        console.log('cities already loaded - skipping')
        return
    } else {
        console.log('Bootstrapping Cities')
        await new Promise((resolve, reject) => {
            const promises = []
            fs.createReadStream('../cities/cities15000.tsv')
                .pipe(csv({ separator: '\t' }))
                .on('data', (row) => {
                    promises.push(addCity(row))
                })
                .on('end', () => {
                    console.log('cities file successfully processed and loaded into db')
                    setTimeout(async () => {
                        await Promise.all(promises)
                        resolve(0)
                    }, 5000)
                })
        })
    }
}
