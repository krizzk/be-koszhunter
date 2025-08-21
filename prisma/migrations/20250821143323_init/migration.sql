/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `booking` ADD COLUMN `invoice_number` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `invoice_pdf` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('OWNER', 'SOCIETY') NOT NULL DEFAULT 'SOCIETY';

-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `rating` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `kosId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `reply_content` TEXT NULL,
    `reply_at` DATETIME(3) NULL,
    `ownerId` INTEGER NULL,

    UNIQUE INDEX `Review_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `kosId` INTEGER NOT NULL,

    UNIQUE INDEX `Facility_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_kosId_fkey` FOREIGN KEY (`kosId`) REFERENCES `Kos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facility` ADD CONSTRAINT `Facility_kosId_fkey` FOREIGN KEY (`kosId`) REFERENCES `Kos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
