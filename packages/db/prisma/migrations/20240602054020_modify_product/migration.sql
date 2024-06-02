/*
  Warnings:

  - You are about to drop the column `adjective` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `material` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Product` table. All the data in the column will be lost.
  - Added the required column `manufacturer` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "adjective",
DROP COLUMN "material",
DROP COLUMN "shortName",
ADD COLUMN     "manufacturer" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;
