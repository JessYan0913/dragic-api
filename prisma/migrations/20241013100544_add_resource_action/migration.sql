/*
  Warnings:

  - Added the required column `action` to the `Permission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resource` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Action" AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD', 'TRACE', 'CONNECT');

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "action" "Action" NOT NULL,
ADD COLUMN     "resource" TEXT NOT NULL;
