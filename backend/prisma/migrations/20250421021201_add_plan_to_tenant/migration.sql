/*
  Warnings:

  - The `plan` column on the `Tenant` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('STARTER', 'BUSINESS', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Tenant" DROP COLUMN "plan",
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'STARTER';
