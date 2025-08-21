import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { BASE_URL } from "../global"
import fs from "fs"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllKos = async (request: Request, response: Response) => {
  try {
    /** get requested data (data has been sent from request) */
    const { search, gender_type } = request.query

    /** build where condition */
    const whereCondition: any = {
      name: { contains: search?.toString() || "" },
    }

    if (gender_type && gender_type !== "") {
      whereCondition.gender_type = gender_type
    }

    /** process to get kos with available rooms count and facilities */
    const allKos = await prisma.kos.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone_number: true,
          },
        },
        rooms: {
          where: { status: "AVAILABLE" },
        },
        facilities: {
          where: { facility_type: "KOS_FACILITY" },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    })

    /** calculate available rooms for each kos */
    const kosWithAvailableRooms = allKos.map((kos) => ({
      ...kos,
      available_rooms: kos.rooms.length,
      rooms: undefined, // remove rooms from response to keep it clean
    }))

    return response
      .json({
        status: true,
        data: kosWithAvailableRooms,
        message: `Kos list has been retrieved`,
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

export const getKosById = async (request: Request, response: Response) => {
  try {
    /** get id from request params */
    const { id } = request.params

    /** process to get kos by ID with rooms and facilities */
    const kos = await prisma.kos.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            email: true,
          },
        },
        rooms: {
          include: {
            bookings: {
              where: {
                status: { in: ["CONFIRMED", "PENDING"] },
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
        },
        facilities: {
          where: { facility_type: "KOS_FACILITY" },
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
      },
    })

    if (!kos) {
      return response
        .json({
          status: false,
          message: `Kos with ID ${id} not found`,
        })
        .status(404)
    }

    return response
      .json({
        status: true,
        data: kos,
        message: `Kos details has been retrieved`,
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

export const createKos = async (request: Request, response: Response) => {
  try {
    /** get requested data - hapus fasilitas_umum */
    const { name, alamat, description, peraturan_kos, gender_type, total_rooms } = request.body

    const user = request.body.user
    const uuid = uuidv4()

    console.log("Request body:", request.body)
    console.log("User from middleware:", user)

    /** check if user exists */
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    /** check if user is OWNER */
    if (user.role !== "OWNER") {
      return response.status(403).json({
        status: false,
        message: `Only owners can create kos. Your role: ${user.role}`,
      })
    }

    /** variable filename for uploaded file */
    let filename = ""
    if (request.file) filename = request.file.filename

    /** process to save new kos - hapus fasilitas_umum */
    const newKos = await prisma.kos.create({
      data: {
        uuid,
        name,
        alamat,
        description: description || "",
        peraturan_kos: peraturan_kos || "",
        gender_type,
        total_rooms: Number(total_rooms),
        available_rooms: Number(total_rooms),
        kos_picture: filename,
        ownerId: Number(user.id),
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
        data: newKos,
        message: `New kos has been created`,
      })
      .status(200)
  } catch (error) {
    console.error("Error creating kos:", error)
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

export const updateKos = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data - hapus fasilitas_umum */
    const { name, alamat, description, peraturan_kos, gender_type, total_rooms } = request.body

    const user = request.body.user

    /** check if user exists */
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    /** make sure kos exists */
    const findKos = await prisma.kos.findFirst({ where: { id: Number(id) } })
    if (!findKos) {
      return response.status(404).json({ status: false, message: `Kos not found` })
    }

    /** check if user is the owner */
    if (user.role !== "OWNER" || findKos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only update your own kos",
      })
    }

    /** handle file upload */
    let filename = findKos.kos_picture
    if (request.file) {
      filename = request.file.filename
      /** delete old picture */
      const path = `${BASE_URL}/../public/kos_picture/${findKos.kos_picture}`
      const exists = fs.existsSync(path)
      if (exists && findKos.kos_picture !== ``) fs.unlinkSync(path)
    }

    /** process to update kos - hapus fasilitas_umum */
    const updatedKos = await prisma.kos.update({
      data: {
        name: name || findKos.name,
        alamat: alamat || findKos.alamat,
        description: description || findKos.description,
        peraturan_kos: peraturan_kos || findKos.peraturan_kos,
        gender_type: gender_type || findKos.gender_type,
        total_rooms: total_rooms ? Number(total_rooms) : findKos.total_rooms,
        kos_picture: filename,
      },
      where: { id: Number(id) },
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
        data: updatedKos,
        message: `Kos has been updated`,
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

export const deleteKos = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    const user = request.body.user

    /** check if user exists */
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    /** make sure kos exists */
    const findKos = await prisma.kos.findFirst({ where: { id: Number(id) } })
    if (!findKos) {
      return response.status(404).json({ status: false, message: `Kos not found` })
    }

    /** check if user is the owner */
    if (user.role !== "OWNER" || findKos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only delete your own kos",
      })
    }

    /** delete kos picture */
    const path = `${BASE_URL}/../public/kos_picture/${findKos.kos_picture}`
    const exists = fs.existsSync(path)
    if (exists && findKos.kos_picture !== ``) fs.unlinkSync(path)

    /** process to delete kos (rooms and facilities will be deleted automatically due to cascade) */
    const deletedKos = await prisma.kos.delete({
      where: { id: Number(id) },
    })

    return response
      .json({
        status: true,
        data: deletedKos,
        message: `Kos has been deleted`,
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
