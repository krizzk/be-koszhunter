-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `email` VARCHAR(191) NOT NULL DEFAULT '',
    `password` VARCHAR(191) NOT NULL DEFAULT '',
    `profile_picture` VARCHAR(191) NOT NULL DEFAULT '',
    `role` ENUM('OWNER', 'USER') NOT NULL DEFAULT 'USER',
    `phone_number` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_uuid_key`(`uuid`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL DEFAULT '',
    `alamat` TEXT NOT NULL DEFAULT '',
    `kos_picture` VARCHAR(191) NOT NULL DEFAULT '',
    `description` TEXT NOT NULL DEFAULT '',
    `fasilitas_umum` TEXT NOT NULL DEFAULT '',
    `gender_type` ENUM('PUTRA', 'PUTRI', 'CAMPUR') NOT NULL DEFAULT 'CAMPUR',
    `available_rooms` INTEGER NOT NULL DEFAULT 0,
    `total_rooms` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `ownerId` INTEGER NULL,

    UNIQUE INDEX `Kos_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Room` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `room_number` VARCHAR(191) NOT NULL DEFAULT '',
    `tipe` VARCHAR(191) NOT NULL DEFAULT '',
    `room_picture` VARCHAR(191) NOT NULL DEFAULT '',
    `fasilitas_kamar` TEXT NOT NULL DEFAULT '',
    `harga` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `kosId` INTEGER NOT NULL,

    UNIQUE INDEX `Room_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NOT NULL,
    `total_price` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `notes` TEXT NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,

    UNIQUE INDEX `Booking_uuid_key`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Kos` ADD CONSTRAINT `Kos_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Room` ADD CONSTRAINT `Room_kosId_fkey` FOREIGN KEY (`kosId`) REFERENCES `Kos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
