/*
  Warnings:

  - You are about to drop the column `category` on the `motorbike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `motorbike` DROP COLUMN `category`,
    ADD COLUMN `class` ENUM('CC_150_225', 'CC_250_UP') NOT NULL DEFAULT 'CC_150_225';
