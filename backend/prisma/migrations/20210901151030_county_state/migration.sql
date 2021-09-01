/*
  Warnings:

  - You are about to drop the column `county` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `county` on the `User` table. All the data in the column will be lost.
  - Added the required column `state` to the `Trip` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "county",
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "county",
ADD COLUMN     "state" TEXT;
