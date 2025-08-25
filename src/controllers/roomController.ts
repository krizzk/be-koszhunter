import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { BASE_URL } from "../global"
import fs from "fs"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getRoomsByKosId = async (request: Request, response: Response) => {
  try {
    /** get kos id from params */
    const { kosId } = request.params
    const { status } = request.query

    /** build where condition */
    const whereCondition: any = {
      kosId: Number(kosId),
    }

    if (status && status !== "") {
      whereCondition.status = status
    }

    /** get rooms by kos id with facilities */
    const rooms = await prisma.room.findMany({
      where: whereCondition,
      include: {
        kos: {
          select: {
            id: true,
            name: true,
            alamat: true,
          },
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone_number: true,
              },
            },
          },
        },
        facilities: {
          where: { facility_type: "ROOM_FACILITY" },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    })

    return response
      .json({
        status: true,
        data: rooms,
        message: `Rooms has been retrieved`,
      })
      .status(200)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

export const getRoomById = async (request: Request, response: Response) => {
  try {
    /** get room id from params */
    const { id } = request.params

    /** get room by id with facilities */
    const room = await prisma.room.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        kos: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                phone_number: true,
                email: true,
              },
            },
          },
        },
        bookings: {
          where: {
            status: { in: ["CONFIRMED", "PENDING"] },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone_number: true,
              },
            },
          },
        },
        facilities: {
          where: { facility_type: "ROOM_FACILITY" },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    })

    if (!room) {
      return response
        .json({
          status: false,
          message: `Room with ID ${id} not found`,
        })
        .status(404)
    }

    return response
      .json({
        status: true,
        data: room,
        message: `Room details has been retrieved`,
      })
      .status(200)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

export const createRoom = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { kosId, room_number, tipe, fasilitas_kamar, harga } = request.body

    const user = request.body.user
    const uuid = uuidv4()

    /** check if kos exists and user is the owner */
    const kos = await prisma.kos.findFirst({
      where: { id: Number(kosId) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone_number: true,
          },
        },
      },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    if (user.role !== "OWNER" || kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only add rooms to your own kos",
      })
    }

    /** Check if room number already exists in this kos */
    const existingRoom = await prisma.room.findFirst({
      where: {
        kosId: Number(kosId),
        room_number: room_number,
      },
    })

    if (existingRoom) {
      return response.status(400).json({
        status: false,
        message: `Room number ${room_number} already exists in this kos`,
      })
    }

    /** variable filename for uploaded file */
    let filename = ""
    if (request.file) filename = request.file.filename

    /** process to save new room */
    const newRoom = await prisma.room.create({
      data: {
        uuid,
        kosId: Number(kosId),
        room_number,
        tipe,
        fasilitas_kamar: fasilitas_kamar || "",
        harga: Number(harga),
        room_picture: filename,
        status: "AVAILABLE", // Default status
      },
      include: {
        kos: {
          select: {
            id: true,
            name: true,
            alamat: true,
          },
        },
      },
    })

    /** Update total_rooms dan available_rooms di kos secara otomatis */
    const updatedKos = await prisma.kos.update({
      where: { id: Number(kosId) },
      data: {
        total_rooms: {
          increment: 1,
        },
        available_rooms: {
          increment: 1, // Karena room baru statusnya AVAILABLE
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone_number: true,
          },
        },
      },
    })

    return response
      .json({
        status: true,
        data: {
          room: newRoom,
          kos_updated: {
            id: updatedKos.id,
            name: updatedKos.name,
            total_rooms: updatedKos.total_rooms,
            available_rooms: updatedKos.available_rooms,
          },
        },
        message: `New room has been created and kos room count updated`,
      })
      .status(201)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

export const updateRoom = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data */
    const { room_number, tipe, fasilitas_kamar, harga, status } = request.body

    const user = request.body.user

    /** make sure room exists */
    const findRoom = await prisma.room.findFirst({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!findRoom) {
      return response.status(404).json({ status: false, message: `Room not found` })
    }

    /** check if user is the owner */
    if (user.role !== "OWNER" || findRoom.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only update rooms in your own kos",
      })
    }

    /** Check if room number already exists in this kos (exclude current room) */
    if (room_number && room_number !== findRoom.room_number) {
      const existingRoom = await prisma.room.findFirst({
        where: {
          kosId: findRoom.kosId,
          room_number: room_number,
          id: { not: Number(id) }, // Exclude current room
        },
      })

      if (existingRoom) {
        return response.status(400).json({
          status: false,
          message: `Room number ${room_number} already exists in this kos`,
        })
      }
    }

    /** handle file upload */
    let filename = findRoom.room_picture
    if (request.file) {
      filename = request.file.filename
      /** delete old picture */
      const path = `${BASE_URL}/../public/room_picture/${findRoom.room_picture}`
      const exists = fs.existsSync(path)
      if (exists && findRoom.room_picture !== ``) fs.unlinkSync(path)
    }

    /** Track status change for kos room count update */
    const oldStatus = findRoom.status
    const newStatus = status || findRoom.status

    /** process to update room */
    const updatedRoom = await prisma.room.update({
      data: {
        room_number: room_number || findRoom.room_number,
        tipe: tipe || findRoom.tipe,
        fasilitas_kamar: fasilitas_kamar || findRoom.fasilitas_kamar,
        harga: harga ? Number(harga) : findRoom.harga,
        status: newStatus,
        room_picture: filename,
      },
      where: { id: Number(id) },
      include: {
        kos: {
          select: {
            id: true,
            name: true,
            alamat: true,
          },
        },
      },
    })

    /** Update available_rooms count in kos if status changed */
    if (oldStatus !== newStatus) {
      let availableRoomsChange = 0

      // Calculate change in available rooms
      if (oldStatus === "AVAILABLE" && newStatus !== "AVAILABLE") {
        availableRoomsChange = -1 // Room became unavailable
      } else if (oldStatus !== "AVAILABLE" && newStatus === "AVAILABLE") {
        availableRoomsChange = 1 // Room became available
      }

      if (availableRoomsChange !== 0) {
        await prisma.kos.update({
          where: { id: findRoom.kosId },
          data: {
            available_rooms: {
              increment: availableRoomsChange,
            },
          },
        })
      }
    }

    return response
      .json({
        status: true,
        data: updatedRoom,
        message: `Room has been updated`,
      })
      .status(200)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

export const deleteRoom = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    const user = request.body.user

    /** make sure room exists */
    const findRoom = await prisma.room.findFirst({
      where: { id: Number(id) },
      include: { kos: true },
    })

    if (!findRoom) {
      return response.status(404).json({ status: false, message: `Room not found` })
    }

    /** check if user is the owner */
    if (user.role !== "OWNER" || findRoom.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only delete rooms in your own kos",
      })
    }

    /** Check if room has active bookings */
    const activeBookings = await prisma.booking.findMany({
      where: {
        roomId: Number(id),
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    })

    if (activeBookings.length > 0) {
      return response.status(400).json({
        status: false,
        message: "Cannot delete room with active bookings. Please cancel or complete all bookings first.",
      })
    }

    /** Track room status for kos count update */
    const roomStatus = findRoom.status

    /** delete room picture */
    const path = `${BASE_URL}/../public/room_picture/${findRoom.room_picture}`
    const exists = fs.existsSync(path)
    if (exists && findRoom.room_picture !== ``) fs.unlinkSync(path)

    /** process to delete room (facilities will be deleted automatically due to cascade) */
    const deletedRoom = await prisma.room.delete({
      where: { id: Number(id) },
    })

    /** Update total_rooms dan available_rooms count in kos */
    let availableRoomsDecrement = 0
    if (roomStatus === "AVAILABLE") {
      availableRoomsDecrement = 1
    }

    const updatedKos = await prisma.kos.update({
      where: { id: findRoom.kosId },
      data: {
        total_rooms: {
          decrement: 1,
        },
        available_rooms: {
          decrement: availableRoomsDecrement,
        },
      },
    })

    return response
      .json({
        status: true,
        data: {
          deleted_room: deletedRoom,
          kos_updated: {
            id: updatedKos.id,
            total_rooms: updatedKos.total_rooms,
            available_rooms: updatedKos.available_rooms,
          },
        },
        message: `Room has been deleted and kos room count updated`,
      })
      .status(200)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}
