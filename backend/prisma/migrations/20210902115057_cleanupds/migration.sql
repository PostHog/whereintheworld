/*
  Warnings:

  - The primary key for the `City` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `geonameid` on the `City` table. All the data in the column will be lost.
  - You are about to drop the column `cityGeonameid` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `cityGeonameid` on the `User` table. All the data in the column will be lost.
  - Added the required column `id` to the `City` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_cityGeonameid_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_cityGeonameid_fkey";

-- AlterTable
ALTER TABLE "City" DROP CONSTRAINT "City_pkey",
DROP COLUMN "geonameid",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "cityGeonameid";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cityGeonameid",
ADD COLUMN     "cityId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
