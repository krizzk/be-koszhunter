/*
  Warnings:

  - You are about to drop the column `fasilitas_umum` on the `kos` table. All the data in the column will be lost.
  - You are about to drop the column `fasilitas_kamar` on the `room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `facility` ADD COLUMN `facility_type` ENUM('KOS_FACILITY', 'ROOM_FACILITY') NOT NULL DEFAULT 'KOS_FACILITY',
    ADD COLUMN `roomId` INTEGER NULL,
    MODIFY `kosId` INTEGER NULL;

-- AlterTable
ALTER TABLE `kos` DROP COLUMN `fasilitas_umum`;

-- AlterTable
ALTER TABLE `room` DROP COLUMN `fasilitas_kamar`;

-- AddForeignKey
ALTER TABLE `Facility` ADD CONSTRAINT `Facility_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
