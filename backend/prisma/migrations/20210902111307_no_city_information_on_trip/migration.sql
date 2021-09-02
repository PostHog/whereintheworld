/*
  Warnings:

  - You are about to drop the column `city` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Trip` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Trip` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "state";
