/*
  Warnings:

  - You are about to drop the column `asciiname` on the `City` table. All the data in the column will be lost.
  - Added the required column `ascii_name` to the `City` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_City" (
    "geonameid" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "ascii_name" TEXT NOT NULL,
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
INSERT INTO "new_City" ("admin1_code", "admin2_code", "admin3_code", "admin4_code", "alternate_names", "cc2", "country_code", "dem", "elevation", "feature_class", "feature_code", "geonameid", "latitude", "longitude", "modification_date", "name", "population", "timezone") SELECT "admin1_code", "admin2_code", "admin3_code", "admin4_code", "alternate_names", "cc2", "country_code", "dem", "elevation", "feature_class", "feature_code", "geonameid", "latitude", "longitude", "modification_date", "name", "population", "timezone" FROM "City";
DROP TABLE "City";
ALTER TABLE "new_City" RENAME TO "City";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
