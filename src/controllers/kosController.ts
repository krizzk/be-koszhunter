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

    /** process to get kos with calculated rooms count and facilities */
    const allKos = await prisma.kos.findMany({
      where: whereCondition,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone_number: true,
            email: true,
          },
        },
        rooms: true, // Get all rooms to calculate counts
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

    /** calculate room counts for each kos */
    const kosWithRoomCounts = allKos.map((kos) => ({
      ...kos,
      total_rooms: kos.rooms.length,
      available_rooms: kos.rooms.filter((room) => room.status === "AVAILABLE").length,
      occupied_rooms: kos.rooms.filter((room) => room.status === "OCCUPIED").length,
      maintenance_rooms: kos.rooms.filter((room) => room.status === "MAINTENANCE").length,
      rooms: undefined, // remove rooms from response to keep it clean
    }))

    return response
      .json({
        status: true,
        data: kosWithRoomCounts,
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

    /** Add calculated room counts */
    const kosWithCounts = {
      ...kos,
      total_rooms: kos.rooms.length,
      available_rooms: kos.rooms.filter((room) => room.status === "AVAILABLE").length,
      occupied_rooms: kos.rooms.filter((room) => room.status === "OCCUPIED").length,
      maintenance_rooms: kos.rooms.filter((room) => room.status === "MAINTENANCE").length,
    }

    return response
      .json({
        status: true,
        data: kosWithCounts,
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
    /** get requested data */
    const { name, alamat, description, peraturan_kos, fasilitas_umum, gender_type } = request.body
    const user = request.body.user
    const uuid = uuidv4()

    /** check if user exists and is authenticated */
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

    /** validate required fields */
    if (!name || !alamat || !gender_type) {
      return response.status(400).json({
        status: false,
        message: "Name, alamat, and gender_type are required fields",
      })
    }

    /** variable filename for uploaded file */
    let filename = ""
    if (request.file) filename = request.file.filename

    /** process to save new kos */
    const newKos = await prisma.kos.create({
      data: {
        uuid,
        name,
        alamat,
        description: description || "",
        peraturan_kos: peraturan_kos || "",
        fasilitas_umum: fasilitas_umum || "",
        gender_type,
        total_rooms: 0,
        available_rooms: 0,
        kos_picture: filename,
        ownerId: Number(user.id),
      },
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
    })

    return response
      .json({
        status: true,
        data: newKos,
        message: `New kos "${newKos.name}" has been created successfully`,
      })
      .status(201)
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error creating kos: ${error}`,
      })
      .status(500)
  }
}

export const updateKos = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data */
    const { name, alamat, description, peraturan_kos, fasilitas_umum, gender_type } = request.body
    const user = request.body.user

    /** check if user exists */
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    /** make sure kos exists */
    const findKos = await prisma.kos.findFirst({
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

    /** process to update kos */
    const updatedKos = await prisma.kos.update({
      data: {
        name: name || findKos.name,
        alamat: alamat || findKos.alamat,
        description: description || findKos.description,
        peraturan_kos: peraturan_kos || findKos.peraturan_kos,
        fasilitas_umum: fasilitas_umum || findKos.fasilitas_umum,
        gender_type: gender_type || findKos.gender_type,
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
        rooms: true,
      },
    })

    /** Add calculated room counts to response */
    const kosWithCounts = {
      ...updatedKos,
      total_rooms: updatedKos.rooms.length,
      available_rooms: updatedKos.rooms.filter((room) => room.status === "AVAILABLE").length,
      rooms: undefined,
    }

    return response
      .json({
        status: true,
        data: kosWithCounts,
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

    /** process to delete kos */
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
