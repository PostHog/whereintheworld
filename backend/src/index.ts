import { PrismaClient } from "@prisma/client";
import express from "express";
import csv from "csv-parser";
import fs from "fs";

const prisma = new PrismaClient();
const app = express();

// Initialize city database

function parseIntNullable(string: string) {
  if (isNaN(parseInt(string))) {
    return undefined;
  }
  return parseInt(string);
}

function parseFloatNullable(string: string) {
  if (isNaN(parseFloat(string))) {
    return undefined;
  }
  return parseFloat(string);
}

async function loadCity(row: any) {
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
  if (await prisma.city.count() > 0) {
    console.log("cities already loaded - skipping");
    return;
  } else {
    fs.createReadStream("../cities/cities15000.tsv")
      .pipe(csv({ separator: "\t" }))
      .on("data", (row) => {
        if (row.geonameid == 3040051) {
          console.log(row);
        }
        loadCity(row);
      })
      .on("end", () => {
        console.log("cities file successfully processed and loaded into db");
      });
  }
}

// load cities
loadCities();

// Webapp configs beyond here

app.use(express.json());

app.get("/drafts", async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: false },
    include: { author: true },
  });
  res.json(posts);
});

app.get("/feed", async (req, res) => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    include: { author: true },
  });
  res.json(posts);
});

app.get("/filterPosts", async (req, res) => {
  const { searchString }: { searchString?: string } = req.query;
  const filteredPosts = await prisma.post.findMany({
    where: {
      OR: [
        {
          title: {
            contains: searchString,
          },
        },
        {
          content: {
            contains: searchString,
          },
        },
      ],
    },
  });
  res.json(filteredPosts);
});

app.post(`/post`, async (req, res) => {
  const { title, content, authorEmail } = req.body;
  const result = await prisma.post.create({
    data: {
      title,
      content,
      published: false,
      author: { connect: { email: authorEmail } },
    },
  });
  res.json(result);
});

app.delete(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.delete({
    where: {
      id: Number(id),
    },
  });
  res.json(post);
});

app.get(`/post/:id`, async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.findUnique({
    where: {
      id: Number(id),
    },
    include: { author: true },
  });
  res.json(post);
});

app.put("/publish/:id", async (req, res) => {
  const { id } = req.params;
  const post = await prisma.post.update({
    where: { id: Number(id) },
    data: { published: true },
  });
  res.json(post);
});

app.post(`/user`, async (req, res) => {
  const result = await prisma.user.create({
    data: {
      ...req.body,
    },
  });
  res.json(result);
});

const server = app.listen(3001, () => {
  console.log("🚀 Server ready at: http://localhost:3001");
});
