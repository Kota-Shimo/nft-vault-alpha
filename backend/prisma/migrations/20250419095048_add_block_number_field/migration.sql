/*
  Warnings:

  - Added the required column `blockNumber` to the `Tx` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tx" ADD COLUMN     "blockNumber" INTEGER NOT NULL;
