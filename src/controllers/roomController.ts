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
    /** get requested data - hapus fasilitas_kamar */
    const { kosId, room_number, tipe, harga } = request.body

    const user = request.body.user
    const uuid = uuidv4()

    /** check if kos exists and user is the owner */
    const kos = await prisma.kos.findFirst({ where: { id: Number(kosId) } })
    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    if (user.role !== "OWNER" || kos.ownerId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only add rooms to your own kos",
      })
    }

    /** variable filename for uploaded file */
    let filename = ""
    if (request.file) filename = request.file.filename

    /** process to save new room - hapus fasilitas_kamar */
    const newRoom = await prisma.room.create({
      data: {
        uuid,
        kosId: Number(kosId),
        room_number,
        tipe,
        harga: Number(harga),
        room_picture: filename,
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

    /** update available rooms count in kos */
    await prisma.kos.update({
      where: { id: Number(kosId) },
      data: {
        available_rooms: {
          increment: 1,
        },
      },
    })

    return response
      .json({
        status: true,
        data: newRoom,
        message: `New room has been created`,
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

export const updateRoom = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data - hapus fasilitas_kamar */
    const { room_number, tipe, harga, status } = request.body

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
    if (user.role !== "OWNER" || findRoom.kos.ownerId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only update rooms in your own kos",
      })
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

    /** process to update room - hapus fasilitas_kamar */
    const updatedRoom = await prisma.room.update({
      data: {
        room_number: room_number || findRoom.room_number,
        tipe: tipe || findRoom.tipe,
        harga: harga ? Number(harga) : findRoom.harga,
        status: status || findRoom.status,
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
    if (user.role !== "OWNER" || findRoom.kos.ownerId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only delete rooms in your own kos",
      })
    }

    /** delete room picture */
    const path = `${BASE_URL}/../public/room_picture/${findRoom.room_picture}`
    const exists = fs.existsSync(path)
    if (exists && findRoom.room_picture !== ``) fs.unlinkSync(path)

    /** process to delete room (facilities will be deleted automatically due to cascade) */
    const deletedRoom = await prisma.room.delete({
      where: { id: Number(id) },
    })

    /** update available rooms count in kos */
    await prisma.kos.update({
      where: { id: findRoom.kosId },
      data: {
        available_rooms: {
          decrement: 1,
        },
      },
    })

    return response
      .json({
        status: true,
        data: deletedRoom,
        message: `Room has been deleted`,
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
