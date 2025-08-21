import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import { BASE_URL } from "../global"
import fs from "fs"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllFacilitiesByKosId = async (request: Request, response: Response) => {
  try {
    const { kosId } = request.params

    const facilities = await prisma.facility.findMany({
      where: {
        kosId: Number(kosId),
        facility_type: "KOS_FACILITY",
      },
      include: {
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return response.json({
      status: true,
      data: facilities,
      message: "Kos facilities retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const getAllFacilitiesByRoomId = async (request: Request, response: Response) => {
  try {
    const { roomId } = request.params

    const facilities = await prisma.facility.findMany({
      where: {
        roomId: Number(roomId),
        facility_type: "ROOM_FACILITY",
      },
      include: {
        room: {
          select: {
            id: true,
            room_number: true,
            tipe: true,
          },
        },
      },
    })

    return response.json({
      status: true,
      data: facilities,
      message: "Room facilities retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const createKosFacility = async (request: Request, response: Response) => {
  try {
    const { kosId, name, description } = request.body
    const user = request.body.user
    const uuid = uuidv4()

    // Check if user exists and is an owner
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if kos exists and user is the owner
    const kos = await prisma.kos.findUnique({
      where: { id: Number(kosId) },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    if (kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only add facilities to your own kos",
      })
    }

    // Handle file upload
    let iconFilename = ""
    if (request.file) {
      iconFilename = request.file.filename
    }

    // Create kos facility
    const newFacility = await prisma.facility.create({
      data: {
        uuid,
        name,
        description,
        icon: iconFilename,
        facility_type: "KOS_FACILITY",
        kosId: Number(kosId),
      },
      include: {
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return response.status(201).json({
      status: true,
      data: newFacility,
      message: "Kos facility created successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const createRoomFacility = async (request: Request, response: Response) => {
  try {
    const { roomId, name, description } = request.body
    const user = request.body.user
    const uuid = uuidv4()

    // Check if user exists and is an owner
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if room exists and user is the owner
    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
      include: { kos: true },
    })

    if (!room) {
      return response.status(404).json({
        status: false,
        message: "Room not found",
      })
    }

    if (room.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only add facilities to rooms in your own kos",
      })
    }

    // Handle file upload
    let iconFilename = ""
    if (request.file) {
      iconFilename = request.file.filename
    }

    // Create room facility
    const newFacility = await prisma.facility.create({
      data: {
        uuid,
        name,
        description,
        icon: iconFilename,
        facility_type: "ROOM_FACILITY",
        roomId: Number(roomId),
      },
      include: {
        room: {
          select: {
            id: true,
            room_number: true,
            tipe: true,
          },
        },
      },
    })

    return response.status(201).json({
      status: true,
      data: newFacility,
      message: "Room facility created successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const updateFacility = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { name, description } = request.body
    const user = request.body.user

    // Check if user exists and is an owner
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
        room: {
          include: { kos: true },
        },
      },
    })

    if (!facility) {
      return response.status(404).json({
        status: false,
        message: "Facility not found",
      })
    }

    // Check if the user is the owner (either kos owner or room's kos owner)
    const isOwner = facility.kos?.ownerId === Number(user.id) || facility.room?.kos.ownerId === Number(user.id)

    if (!isOwner) {
      return response.status(403).json({
        status: false,
        message: "You can only update facilities for your own kos/rooms",
      })
    }

    // Handle file upload
    let iconFilename = facility.icon
    if (request.file) {
      iconFilename = request.file.filename
      // Delete old icon if exists
      if (facility.icon) {
        const path = `${BASE_URL}/../public/facility_icons/${facility.icon}`
        const exists = fs.existsSync(path)
        if (exists) fs.unlinkSync(path)
      }
    }

    // Update facility
    const updatedFacility = await prisma.facility.update({
      where: { id: Number(id) },
      data: {
        name: name || facility.name,
        description: description || facility.description,
        icon: iconFilename,
      },
      include: {
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
        room: {
          select: {
            id: true,
            room_number: true,
            tipe: true,
          },
        },
      },
    })

    return response.json({
      status: true,
      data: updatedFacility,
      message: "Facility updated successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const deleteFacility = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user = request.body.user

    // Check if user exists and is an owner
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if facility exists
    const facility = await prisma.facility.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
        room: {
          include: { kos: true },
        },
      },
    })

    if (!facility) {
      return response.status(404).json({
        status: false,
        message: "Facility not found",
      })
    }

    // Check if the user is the owner (either kos owner or room's kos owner)
    const isOwner = facility.kos?.ownerId === Number(user.id) || facility.room?.kos.ownerId === Number(user.id)

    if (!isOwner) {
      return response.status(403).json({
        status: false,
        message: "You can only delete facilities for your own kos/rooms",
      })
    }

    // Delete icon file if exists
    if (facility.icon) {
      const path = `${BASE_URL}/../public/facility_icons/${facility.icon}`
      const exists = fs.existsSync(path)
      if (exists) fs.unlinkSync(path)
    }

    // Delete facility
    const deletedFacility = await prisma.facility.delete({
      where: { id: Number(id) },
    })

    return response.json({
      status: true,
      data: deletedFacility,
      message: "Facility deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}
