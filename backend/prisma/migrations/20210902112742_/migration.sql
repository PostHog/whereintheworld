/*
  Warnings:

  - You are about to drop the column `cityId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" ADD COLUMN     "cityGeonameid" INTEGER,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "cityId",
ADD COLUMN     "cityGeonameid" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD FOREIGN KEY ("cityGeonameid") REFERENCES "City"("geonameid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD FOREIGN KEY ("cityGeonameid") REFERENCES "City"("geonameid") ON DELETE SET NULL ON UPDATE CASCADE;
