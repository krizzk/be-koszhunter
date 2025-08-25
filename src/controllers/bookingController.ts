import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"
import PDFDocument from "pdfkit"
import fs from "fs"
import path from "path"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllBookings = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { search, status } = request.query
    const user = request.body.user

    /** build where condition */
    const whereCondition: any = {}

    if (search) {
      whereCondition.OR = [
        { user: { name: { contains: search.toString() } } },
        { room: { kos: { name: { contains: search.toString() } } } },
      ]
    }

    if (status && status !== "") {
      whereCondition.status = status
    }

    /** if user is society, only show their bookings */
    /** if user is owner, only show bookings for their kos */
    if (user.role === "SOCIETY") {
      whereCondition.userId = user.id
    } else if (user.role === "OWNER") {
      whereCondition.room = {
        kos: {
          ownerId: user.id,
        },
      }
    }

    /** process to get bookings */
    const allBookings = await prisma.booking.findMany({
      where: whereCondition,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        room: {
          include: {
            kos: {
              select: {
                id: true,
                name: true,
                alamat: true,
                owner: {
                  select: {
                    id: true,
                    name: true,
                    phone_number: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return response
      .json({
        status: true,
        data: allBookings,
        message: `Booking list has been retrieved`,
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

export const getBookingById = async (request: Request, response: Response) => {
  try {
    /** get booking id from params */
    const { id } = request.params

    /** process to get booking by ID */
    const booking = await prisma.booking.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        room: {
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
          },
        },
      },
    })

    if (!booking) {
      return response
        .json({
          status: false,
          message: `Booking with ID ${id} not found`,
        })
        .status(404)
    }

    return response
      .json({
        status: true,
        data: booking,
        message: `Booking has been retrieved`,
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

export const createBooking = async (request: Request, response: Response) => {
  try {
    /** get requested data */
    const { roomId, start_date, end_date, notes } = request.body
    const user = request.body.user
    const uuid = uuidv4()

    /** check if room exists and is available */
    const room = await prisma.room.findFirst({
      where: {
        id: Number(roomId),
        status: "AVAILABLE",
      },
      include: { kos: true },
    })

    if (!room) {
      return response.status(404).json({
        status: false,
        message: "Room not found or not available",
      })
    }

    /** check if room is already booked for the selected dates */
    const existingBooking = await prisma.booking.findFirst({
      where: {
        roomId: Number(roomId),
        status: { in: ["CONFIRMED", "PENDING"] },
        OR: [
          {
            AND: [{ start_date: { lte: new Date(start_date) } }, { end_date: { gte: new Date(start_date) } }],
          },
          {
            AND: [{ start_date: { lte: new Date(end_date) } }, { end_date: { gte: new Date(end_date) } }],
          },
          {
            AND: [{ start_date: { gte: new Date(start_date) } }, { end_date: { lte: new Date(end_date) } }],
          },
        ],
      },
    })

    if (existingBooking) {
      return response.status(400).json({
        status: false,
        message: "Room is already booked for the selected dates",
      })
    }

    /** calculate total price based on duration and room price */
    const startDate = new Date(start_date)
    const endDate = new Date(end_date)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const monthlyRate = room.harga
    const dailyRate = monthlyRate / 30 // approximate daily rate
    const total_price = Math.ceil(dailyRate * diffDays)

    /** process to save new booking */
    const newBooking = await prisma.booking.create({
      data: {
        uuid,
        userId: user.id,
        roomId: Number(roomId),
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        total_price,
        notes: notes || "",
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        room: {
          include: {
            kos: {
              select: {
                id: true,
                name: true,
                alamat: true,
              },
            },
          },
        },
      },
    })

    return response
      .json({
        status: true,
        data: newBooking,
        message: `New booking has been created`,
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

export const updateBookingStatus = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    /** get requested data */
    const { status } = request.body
    const user = request.body.user

    /** make sure booking exists */
    const findBooking = await prisma.booking.findFirst({
      where: { id: Number(id) },
      include: {
        room: {
          include: { kos: true },
        },
      },
    })

    if (!findBooking) {
      return response.status(404).json({ status: false, message: `Booking not found` })
    }

    /** check authorization */
    if (user.role === "SOCIETY" && findBooking.userId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only update your own bookings",
      })
    }

    if (user.role === "OWNER" && findBooking.room.kos.ownerId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only update bookings for your own kos",
      })
    }

    /** process to update booking status */
    const updatedBooking = await prisma.booking.update({
      data: { status: status || findBooking.status },
      where: { id: Number(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        room: {
          include: {
            kos: {
              select: {
                id: true,
                name: true,
                alamat: true,
              },
            },
          },
        },
      },
    })

    /** update room status if booking is confirmed or cancelled */
    if (status === "CONFIRMED") {
      await prisma.room.update({
        where: { id: findBooking.roomId },
        data: { status: "OCCUPIED" },
      })
    } else if (status === "CANCELLED" || status === "COMPLETED") {
      await prisma.room.update({
        where: { id: findBooking.roomId },
        data: { status: "AVAILABLE" },
      })
    }

    return response
      .json({
        status: true,
        data: updatedBooking,
        message: `Booking status has been updated`,
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

export const deleteBooking = async (request: Request, response: Response) => {
  try {
    /** get id from params */
    const { id } = request.params
    const user = request.body.user

    /** make sure booking exists */
    const findBooking = await prisma.booking.findFirst({
      where: { id: Number(id) },
      include: {
        room: {
          include: { kos: true },
        },
      },
    })

    if (!findBooking) {
      return response.status(404).json({ status: false, message: `Booking not found` })
    }

    /** check authorization */
    if (user.role === "SOCIETY" && findBooking.userId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only delete your own bookings",
      })
    }

    if (user.role === "OWNER" && findBooking.room.kos.ownerId !== user.id) {
      return response.status(403).json({
        status: false,
        message: "You can only delete bookings for your own kos",
      })
    }

    /** process to delete booking */
    const deletedBooking = await prisma.booking.delete({
      where: { id: Number(id) },
    })

    /** update room status back to available */
    await prisma.room.update({
      where: { id: findBooking.roomId },
      data: { status: "AVAILABLE" },
    })

    return response
      .json({
        status: true,
        data: deletedBooking,
        message: `Booking has been deleted`,
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

// Generate invoice untuk society mencetak bukti pemesanan
export const generateInvoice = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user = request.body.user

    // Check if user exists and is authenticated
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        room: {
          include: {
            kos: true,
          },
        },
      },
    })

    if (!booking) {
      return response.status(404).json({
        status: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized (booking owner or kos owner)
    if (booking.userId !== Number(user.id) && booking.room.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You are not authorized to access this invoice",
      })
    }

    // Generate invoice number if not exists
    let invoiceNumber = booking.invoice_number
    if (!invoiceNumber) {
      invoiceNumber = `INV-${new Date().getFullYear()}${(new Date().getMonth() + 1)
        .toString()
        .padStart(2, "0")}${new Date().getDate().toString().padStart(2, "0")}-${booking.id}`

      await prisma.booking.update({
        where: { id: Number(id) },
        data: { invoice_number: invoiceNumber },
      })
    }

    // Create PDF directory if not exists
    const pdfDir = path.join(process.cwd(), "public", "invoices")
    if (!fs.existsSync(pdfDir)) {
      fs.mkdirSync(pdfDir, { recursive: true })
    }

    // Define PDF filename
    const pdfFilename = `invoice-${invoiceNumber}.pdf`
    const pdfPath = path.join(pdfDir, pdfFilename)

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 })
    const writeStream = fs.createWriteStream(pdfPath)
    doc.pipe(writeStream)

    // Add content to PDF
    // Header
    doc.fontSize(20).text("KOS HUNTER", { align: "center" })
    doc.fontSize(16).text("BUKTI PEMESANAN", { align: "center" })
    doc.moveDown()

    // Invoice details
    doc.fontSize(12).text(`Nomor Invoice: ${invoiceNumber}`)
    doc.text(`Tanggal: ${new Date(booking.createdAt).toLocaleDateString()}`)
    doc.moveDown()

    // Customer details
    doc.fontSize(14).text("Detail Pemesan:")
    doc.fontSize(12).text(`Nama: ${booking.user.name}`)
    doc.text(`Email: ${booking.user.email}`)
    doc.text(`Telepon: ${booking.user.phone_number}`)
    doc.moveDown()

    // Kos details
    doc.fontSize(14).text("Detail Kos:")
    doc.fontSize(12).text(`Nama Kos: ${booking.room.kos.name}`)
    doc.text(`Alamat: ${booking.room.kos.alamat}`)
    doc.text(`Kamar: ${booking.room.room_number} (${booking.room.tipe})`)
    doc.moveDown()

    // Booking details
    doc.fontSize(14).text("Detail Pemesanan:")
    doc.fontSize(12).text(`Tanggal Mulai: ${new Date(booking.start_date).toLocaleDateString()}`)
    doc.text(`Tanggal Selesai: ${new Date(booking.end_date).toLocaleDateString()}`)
    doc.text(`Status: ${booking.status}`)
    doc.moveDown()

    // Payment details
    doc.fontSize(14).text("Detail Pembayaran:")
    doc.fontSize(12).text(`Total Harga: Rp ${booking.total_price.toLocaleString("id-ID")}`)
    doc.moveDown()

    // Notes
    if (booking.notes) {
      doc.fontSize(14).text("Catatan:")
      doc.fontSize(12).text(booking.notes)
      doc.moveDown()
    }

    // Footer
    doc.fontSize(10).text("Terima kasih telah menggunakan layanan Kos Hunter!", { align: "center" })
    doc.text("Dokumen ini adalah bukti pemesanan yang sah.", { align: "center" })

    // Finalize PDF
    doc.end()

    // Wait for PDF to be created
    writeStream.on("finish", async () => {
      // Update booking with invoice PDF path
      await prisma.booking.update({
        where: { id: Number(id) },
        data: { invoice_pdf: pdfFilename },
      })

      // Return success response with download link
      return response.json({
        status: true,
        data: {
          invoice_number: invoiceNumber,
          download_url: `/uploads/invoices/${pdfFilename}`,
        },
        message: "Invoice generated successfully",
      })
    })

    writeStream.on("error", (error) => {
      return response.status(500).json({
        status: false,
        message: `Error generating invoice: ${error}`,
      })
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

// Histori transaksi untuk owner - dipindahkan dari reportController
export const getBookingHistory = async (request: Request, response: Response) => {
  try {
    const { startDate, endDate, month, year } = request.query
    const user = request.body.user

    // Check if user exists and is authenticated
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if user is an owner
    if (user.role !== "OWNER") {
      return response.status(403).json({
        status: false,
        message: "Only owners can access booking history",
      })
    }

    // Build where condition
    const whereCondition: any = {
      room: {
        kos: {
          ownerId: Number(user.id),
        },
      },
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      whereCondition.createdAt = {
        gte: new Date(startDate.toString()),
        lte: new Date(endDate.toString()),
      }
    }
    // Filter by month and year if provided
    else if (month && year) {
      const monthNum = Number(month)
      const yearNum = Number(year)

      if (monthNum >= 1 && monthNum <= 12 && yearNum >= 2000) {
        const startOfMonth = new Date(yearNum, monthNum - 1, 1)
        const endOfMonth = new Date(yearNum, monthNum, 0, 23, 59, 59)

        whereCondition.createdAt = {
          gte: startOfMonth,
          lte: endOfMonth,
        }
      }
    }

    // Get bookings
    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone_number: true,
          },
        },
        room: {
          include: {
            kos: {
              select: {
                id: true,
                name: true,
                alamat: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Calculate summary
    const summary = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((sum, booking) => sum + booking.total_price, 0),
      pendingBookings: bookings.filter((b) => b.status === "PENDING").length,
      confirmedBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
      cancelledBookings: bookings.filter((b) => b.status === "CANCELLED").length,
      completedBookings: bookings.filter((b) => b.status === "COMPLETED").length,
    }

    return response.json({
      status: true,
      data: {
        bookings,
        summary,
      },
      message: "Booking history retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}
