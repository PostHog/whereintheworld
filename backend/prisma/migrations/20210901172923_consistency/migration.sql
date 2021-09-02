/*
  Warnings:

  - You are about to drop the column `city_id` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Trip` table. All the data in the column will be lost.
  - Added the required column `cityId` to the `Trip` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "city_id",
DROP COLUMN "user_id",
ADD COLUMN     "cityId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;
