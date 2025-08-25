-- AlterTable
ALTER TABLE `kos` ADD COLUMN `fasilitas_umum` TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `room` ADD COLUMN `fasilitas_kamar` TEXT NOT NULL DEFAULT '';
