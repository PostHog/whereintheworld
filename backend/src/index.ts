import { PrismaClient } from "@prisma/client";
import express from "express";
import csv from "csv-parser";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const app = express();

// Initialize city database

function parseIntNullable(string: string) {
  if (isNaN(parseInt(string))) {
    return undefined;
  }
  return parseInt(string);
}

async function addCity(row: any) {
  await prisma.city.create({
    data: {
      geonameid: parseInt(row.geonameid),
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
  });
}

async function loadCities() {
  if ((await prisma.city.count()) > 0) {
    console.log("cities already loaded - skipping");
    return;
  } else {
    console.log("Bootstrapping Cities");
    fs.createReadStream("../cities/cities15000.tsv")
      .pipe(csv({ separator: "\t" }))
      .on("data", (row) => {
        addCity(row);
      })
      .on("end", () => {
        console.log("cities file successfully processed and loaded into db");
      });
  }
}

// load the only team (for now)

async function addTeam(team: any) {
  await prisma.team.create({
    data: {
      name: team.name,
      description: team.description,
    },
  });
}

async function bootstrapTeam() {
  if ((await prisma.team.count()) > 0) {
    console.log("team already loaded - skipping");
    return;
  } else {
    console.log("Bootstrapping PostHog team");
    addTeam({
      name: "PostHog",
      description: "PostHog is going places",
    });
  }
}

// load users

async function addUser(user: any, team = 1) {
  await prisma.user.create({
    data: {
      fullName: user.full_name,
      email: user.email,
      city: user.city,
      state: user.county,
      country: user.country,
      team: {
        connect: {
          id: team,
        },
      },
    },
  });
}

async function loadUsersFromTSV(usersTSV = "user_bootstrap.tsv", team = 1) {
  if ((await prisma.user.count()) > 0) {
    console.log("users already loaded - skipping");
    return;
  } else {
    fs.createReadStream(usersTSV)
      .pipe(csv({ separator: "\t" }))
      .on("data", (row) => {
        addUser(row, team);
      })
      .on("end", () => {
        console.log("users file successfully processed and loaded into db");
      });
  }
}

// bootstrap cities
loadCities();

// bootstrap the only team
bootstrapTeam();

// bootstrap users
// loadUsersFromTSV("user_bootstrap.tsv", 1);

// Webapp configs beyond here

app.use(express.json());

app.get("/trips", async (req, res) => {
  const trips = await prisma.trip.findMany();
  res.json(trips);
});

app.get("/trip/:id", async (req, res) => {
  const { id } = req.params;
  const trip = await prisma.trip.findUnique({
    where: {
      id: Number(id),
    },
  });
  res.json(trip);
});

app.post(`/trip`, async (req, res) => {
  const { user_id, country, state, city, start, end } = req.body;
  const startDate = new Date(start)
  const endDate = new Date(end) 
  const scheduledTrips = await prisma.trip.findMany({
    where: {user_id: Number(user_id)},
  }); 
  for (let scheduledTrip of scheduledTrips) {
    // check if the about to be scheduled trip overlaps with any of the scheduled trips 
    if (scheduledTrip.start <= startDate || endDate <= scheduledTrip.end) {
      res.json({"error": "overlapping trip"});
      return;
    }
  }
  try {
    const trip = await prisma.trip.create({
      data: {
        user_id: Number(user_id),
        country: country,
        state: state,
        city: city,
        start: startDate,
        end: endDate,
      },
    });
    res.json(trip);
  } catch (e) {
    console.log(e);
    res.json({ error: "check console" });
  }
});

app.put("/trip/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, country, state, city, start, end } = req.body;
  const scheduledTrips = await prisma.trip.findMany({
    where: {user_id: Number(user_id)},
  }); 
  for (let scheduledTrip of scheduledTrips) {
    // check if the about to be scheduled trip overlaps with any of the scheduled trips 
    if (scheduledTrip.start <= start || end <= scheduledTrip.end) {
      res.json({"error": "overlapping trip"});
      return;
    }
  }
  const trip = await prisma.trip.update({
    where: { id: Number(id) },
    data: {
      user_id: Number(user_id),
      country: country,
      state: state,
      city: city,
      start: new Date(start),
      end: new Date(end),
    },
  });
  res.json(trip);
});

app.delete(`/trip/:id`, async (req, res) => {
  const { id } = req.params;
  try {
  const post = await prisma.trip.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(post);
  } catch (e) {
    console.log(e);
    res.json({ error: "check console" });
  }
});

app.get("/users/near/:id", async (req, res) => {
  const { id } = req.params;
  return id;
});

app.get("/users/location/:date", async (req, res) => {
  const { date } = req.params;
  return date;
});

app.post(`/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  });
  res.json(result);
});
app.use(express.static(path.join(__dirname, '../../frontend/public')));

const server = app.listen(parseInt(process.env.PORT || '3001'), '0.0.0.0', () => {
  console.log("🚀 Server ready at: http://localhost:" + (process.env.PORT || 3001));
});



