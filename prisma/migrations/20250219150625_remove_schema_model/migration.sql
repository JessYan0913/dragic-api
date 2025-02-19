/*
  Warnings:

  - You are about to drop the `Schema` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Schema" DROP CONSTRAINT "Schema_applicationId_fkey";

-- DropTable
DROP TABLE "Schema";
