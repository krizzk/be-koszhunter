/*
  Warnings:

  - You are about to drop the column `Brand` on the `motorbike` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `motorbike` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `motorbike` DROP COLUMN `Brand`,
    DROP COLUMN `class`,
    ADD COLUMN `Class` ENUM('CC_150_225', 'CC_250_UP') NOT NULL DEFAULT 'CC_150_225',
    ADD COLUMN `brand` ENUM('HONDA', 'YAMAHA', 'SUZUKI', 'KAWASAKI', 'DUCATI', 'KTM', 'BMW', 'APRILIA', 'HARLEY_DAVIDSON', 'TRIUMPH') NOT NULL DEFAULT 'HONDA';
