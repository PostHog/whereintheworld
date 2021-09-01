/*
  Warnings:

  - You are about to drop the `LocationOverride` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LocationOverride";

-- CreateTable
CREATE TABLE "Trip" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip.user_id_unique" ON "Trip"("user_id");
