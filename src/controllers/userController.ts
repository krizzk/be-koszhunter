import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import fs from "fs"
import { BASE_URL, SECRET } from "../global"
import { v4 as uuidv4 } from "uuid"
import md5 from "md5"
import { sign } from "jsonwebtoken"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllUsers = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { search } = request.query

    /** process to get user */
    const allUser = await prisma.user.findMany({
      where: { name: { contains: search?.toString() || "" } },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        profile_picture: true,
        role: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return response
      .json({
        status: true,
        data: allUser,
        message: `Users has been retrieved`,
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

export const getUserById = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { id } = request.body.user

    if (!id) {
      return response
        .json({
          status: false,
          message: `User Not Found`,
        })
        .status(400)
    }

    /** process to get user */
    const user = await prisma.user.findFirst({
      where: { id: Number(id) },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        profile_picture: true,
        role: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return response
      .json({
        status: true,
        data: user,
        message: `User has been retrieved`,
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

export const createUser = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { name, email, password, role, phone_number } = request.body
    const uuid = uuidv4()

    /** check if email or phone number already exists */
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phone_number: phone_number }],
      },
    })

    if (existingUser) {
      return response.status(400).json({
        status: false,
        message: existingUser.email === email ? "Email is already in use" : "Phone number is already in use",
      })
    }

    /** variable filename for uploaded file */
    let filename = ""
    if (request.file) filename = request.file.filename

    /** process to save new user */
    const newUser = await prisma.user.create({
      data: {
        uuid,
        name,
        email,
        password: md5(password),
        role,
        phone_number,
        profile_picture: filename,
      },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        profile_picture: true,
        role: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return response.status(201).json({
      status: true,
      data: newUser,
      message: `New user has been created successfully`,
    })
  } catch (error) {
    return response.status(500).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const updateUser = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data */
    const { name, email, password, role, phone_number } = request.body

    /** make sure user exists */
    const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
    if (!findUser) {
      return response.status(404).json({ status: false, message: `User not found` })
    }

    /** handle file upload */
    let filename = findUser.profile_picture
    if (request.file) {
      filename = request.file.filename
      /** delete old picture */
      const path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
      const exists = fs.existsSync(path)
      if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
    }

    /** process to update user */
    const updatedUser = await prisma.user.update({
      data: {
        name: name || findUser.name,
        email: email || findUser.email,
        password: password ? md5(password) : findUser.password,
        role: role || findUser.role,
        phone_number: phone_number || findUser.phone_number,
        profile_picture: filename,
      },
      where: { id: Number(id) },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        profile_picture: true,
        role: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return response
      .json({
        status: true,
        data: updatedUser,
        message: `User has been updated`,
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

export const changePicture = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params

    /** make sure user exists */
    const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
    if (!findUser) {
      return response.status(404).json({ status: false, message: `User not found` })
    }

    /** handle file upload */
    let filename = findUser.profile_picture
    if (request.file) {
      filename = request.file.filename
      /** delete old picture */
      const path = `${BASE_URL}/../public/profile_picture/${findUser.profile_picture}`
      const exists = fs.existsSync(path)
      if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)
    }

    /** process to update picture */
    const updatePicture = await prisma.user.update({
      data: { profile_picture: filename },
      where: { id: Number(id) },
      select: {
        id: true,
        uuid: true,
        name: true,
        email: true,
        profile_picture: true,
        role: true,
        phone_number: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return response
      .json({
        status: true,
        data: updatePicture,
        message: `Picture has been changed`,
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

export const deleteUser = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params

    /** make sure user exists */
    const findUser = await prisma.user.findFirst({ where: { id: Number(id) } })
    if (!findUser) {
      return response.status(404).json({ status: false, message: `User not found` })
    }

    /** delete profile picture */
    const path = `${BASE_URL}/public/profile_picture/${findUser.profile_picture}`
    const exists = fs.existsSync(path)
    if (exists && findUser.profile_picture !== ``) fs.unlinkSync(path)

    /** process to delete user */
    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
    })

    return response
      .json({
        status: true,
        data: deletedUser,
        message: `User has been deleted`,
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

export const authentication = async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body

    /** find valid user based on email and password */
    const findUser = await prisma.user.findFirst({
      where: { email, password: md5(password) },
    })

    /** check if user exists */
    if (!findUser) {
      return response.status(401).json({ status: false, logged: false, message: `Email or password is invalid` })
    }

    const data = {
      id: findUser.id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
      phone_number: findUser.phone_number,
      profile_picture: findUser.profile_picture,
    }

    /** define payload to generate token */
    const payload = JSON.stringify(data)

    /** generate token */
    const token = sign(payload, SECRET || "joss")

    return response.status(200).json({
      status: true,
      logged: true,
      data: data,
      message: `Login Success`,
      token,
    })
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`,
      })
      .status(400)
  }
}

// DASHBOARD FUNCTIONS - Dipindahkan dari reportController
export const getDashboard = async (request: Request, response: Response) => {
  try {
    /** get dashboard statistics */
    const allUsers = await prisma.user.findMany()
    const allKos = await prisma.kos.findMany()
    const allRooms = await prisma.room.findMany()
    const pendingBookings = await prisma.booking.findMany({
      where: { status: "PENDING" },
    })
    const confirmedBookings = await prisma.booking.findMany({
      where: { status: "CONFIRMED" },
    })
    const completedBookings = await prisma.booking.findMany({
      where: { status: "COMPLETED" },
    })

    return response
      .json({
        status: true,
        data: {
          totalUsers: allUsers.length,
          totalKos: allKos.length,
          totalRooms: allRooms.length,
          availableRooms: allRooms.filter((room) => room.status === "AVAILABLE").length,
          occupiedRooms: allRooms.filter((room) => room.status === "OCCUPIED").length,
          pendingBookings: pendingBookings.length,
          confirmedBookings: confirmedBookings.length,
          completedBookings: completedBookings.length,
          totalOwners: allUsers.filter((user) => user.role === "OWNER").length,
          totalSociety: allUsers.filter((user) => user.role === "SOCIETY").length,
        },
        message: `Dashboard data has been retrieved`,
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

export const getPopularKos = async (request: Request, response: Response) => {
  try {
    /** get bookings with kos information */
    const bookings = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "COMPLETED"] },
      },
      include: {
        room: {
          include: {
            kos: true,
          },
        },
      },
    })

    /** count bookings per kos */
    const kosCount: { [key: string]: any } = {}

    bookings.forEach((booking) => {
      const kosId = booking.room.kos.id
      const kosName = booking.room.kos.name

      if (!kosCount[kosId]) {
        kosCount[kosId] = {
          id: kosId,
          name: kosName,
          alamat: booking.room.kos.alamat,
          kos_picture: booking.room.kos.kos_picture,
          gender_type: booking.room.kos.gender_type,
          bookingCount: 0,
          totalRevenue: 0,
        }
      }

      kosCount[kosId].bookingCount += 1
      kosCount[kosId].totalRevenue += booking.total_price
    })

    /** convert to array and sort by booking count */
    const result = Object.values(kosCount)
      .sort((a: any, b: any) => b.bookingCount - a.bookingCount)
      .slice(0, 10) // top 10

    return response
      .json({
        status: true,
        data: result,
        message: "Popular kos data has been retrieved",
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
