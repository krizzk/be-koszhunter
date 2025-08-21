import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ errorFormat: "pretty" })

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
          totalCustomers: allUsers.filter((user) => user.role === "USER").length,
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

export const getRevenueReport = async (request: Request, response: Response) => {
  try {
    const { startDate, endDate } = request.query

    /** build where condition for date range */
    const whereCondition: any = {
      status: { in: ["CONFIRMED", "COMPLETED"] },
    }

    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate.toString()),
        lte: new Date(endDate.toString()),
      }
    }

    /** get bookings for revenue calculation */
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        room: {
          include: {
            kos: {
              include: {
                owner: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    /** calculate revenue by owner */
    const revenueByOwner: { [key: string]: any } = {}

    bookings.forEach((booking) => {
      const ownerId = booking.room.kos.owner?.id
      const ownerName = booking.room.kos.owner?.name

      if (ownerId && !revenueByOwner[ownerId]) {
        revenueByOwner[ownerId] = {
          ownerId,
          ownerName,
          totalRevenue: 0,
          bookingCount: 0,
          kosList: new Set(),
        }
      }

      if (ownerId) {
        revenueByOwner[ownerId].totalRevenue += booking.total_price
        revenueByOwner[ownerId].bookingCount += 1
        revenueByOwner[ownerId].kosList.add(booking.room.kos.name)
      }
    })

    /** convert sets to arrays and calculate totals */
    const result = Object.values(revenueByOwner).map((owner: any) => ({
      ...owner,
      kosList: Array.from(owner.kosList),
      kosCount: owner.kosList.size,
    }))

    const totalRevenue = bookings.reduce((sum, booking) => sum + booking.total_price, 0)
    const totalBookings = bookings.length

    return response
      .json({
        status: true,
        data: {
          revenueByOwner: result,
          summary: {
            totalRevenue,
            totalBookings,
            averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
          },
        },
        message: "Revenue report has been retrieved",
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

export const getBookingTrends = async (request: Request, response: Response) => {
  try {
    /** get bookings grouped by month */
    const bookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(new Date().getFullYear(), 0, 1), // from start of current year
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    /** group bookings by month */
    const monthlyData: { [key: string]: any } = {}

    bookings.forEach((booking) => {
      const month = booking.createdAt.toISOString().substring(0, 7) // YYYY-MM format

      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          totalBookings: 0,
          totalRevenue: 0,
          pendingBookings: 0,
          confirmedBookings: 0,
          cancelledBookings: 0,
          completedBookings: 0,
        }
      }

      monthlyData[month].totalBookings += 1
      monthlyData[month].totalRevenue += booking.total_price

      switch (booking.status) {
        case "PENDING":
          monthlyData[month].pendingBookings += 1
          break
        case "CONFIRMED":
          monthlyData[month].confirmedBookings += 1
          break
        case "CANCELLED":
          monthlyData[month].cancelledBookings += 1
          break
        case "COMPLETED":
          monthlyData[month].completedBookings += 1
          break
      }
    })

    const result = Object.values(monthlyData)

    return response
      .json({
        status: true,
        data: result,
        message: "Booking trends has been retrieved",
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
