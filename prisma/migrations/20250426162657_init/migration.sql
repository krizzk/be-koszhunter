/*
  Warnings:

  - You are about to alter the column `category` on the `motorbike` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `motorbike` ADD COLUMN `BPKB` ENUM('YES', 'NO') NOT NULL DEFAULT 'NO',
    ADD COLUMN `Brand` ENUM('HONDA', 'YAMAHA', 'SUZUKI', 'KAWASAKI', 'DUCATI', 'KTM', 'BMW', 'APRILIA', 'HARLEY_DAVIDSON', 'TRIUMPH') NOT NULL DEFAULT 'HONDA',
    ADD COLUMN `STNK` ENUM('YES', 'NO') NOT NULL DEFAULT 'NO',
    ADD COLUMN `kilometer` ENUM('KM0_KM900', 'KM1000_KM2999', 'KM3000_KM4999', 'KM5000_KM6999', 'KM7000_UP') NOT NULL DEFAULT 'KM0_KM900',
    ADD COLUMN `tax` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `category` ENUM('CC_150_225', 'CC_250_UP') NOT NULL DEFAULT 'CC_150_225';
