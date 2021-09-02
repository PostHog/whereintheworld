/*
  Warnings:

  - You are about to drop the column `latitude` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `User` table. All the data in the column will be lost.
  - Added the required column `city_id` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cityId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "city_id" INTEGER NOT NULL,
ALTER COLUMN "state" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "cityId" INTEGER NOT NULL;
