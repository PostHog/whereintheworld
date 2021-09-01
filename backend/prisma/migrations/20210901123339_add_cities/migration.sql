-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" INTEGER,
    FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "City" (
    "geonameid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "asciiname" TEXT NOT NULL,
    "alternate_names" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "feature_class" TEXT NOT NULL,
    "feature_code" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "cc2" TEXT NOT NULL,
    "admin1_code" TEXT NOT NULL,
    "admin2_code" TEXT NOT NULL,
    "admin3_code" TEXT NOT NULL,
    "admin4_code" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "elevation" INTEGER NOT NULL,
    "dem" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "modification_date" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User.email_unique" ON "User"("email");
