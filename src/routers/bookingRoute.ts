import express from "express"
import {
  createBooking,
  updateBookingStatus,
  deleteBooking,
  getBookingById,
  getAllBookings,
  generateInvoice,
  getBookingHistory,
} from "../controllers/bookingController"
import { verifyAddBooking, verifyEditBookingStatus } from "../middleware/bookingValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"

const app = express()
app.use(express.json())

/**
 * @swagger
 * components:
 *   schemas:
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         start_date:
 *           type: string
 *           format: date
 *         end_date:
 *           type: string
 *           format: date
 *         total_price:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *         notes:
 *           type: string
 *       example:
 *         id: 1
 *         start_date: "2024-01-01"
 *         end_date: "2024-01-31"
 *         total_price: 800000
 *         status: "PENDING"
 *         notes: "Booking untuk 1 bulan"
 * tags:
 *   name: Bookings
 *   description: Booking management API
 */

// Basic CRUD operations
app.get(`/`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getAllBookings)
app.get(`/:id`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getBookingById)

app.post(`/`, [verifyToken, verifyRole(["SOCIETY"]), verifyAddBooking], createBooking)
app.put(`/:id/status`, [verifyToken, verifyRole(["OWNER", "SOCIETY"]), verifyEditBookingStatus], updateBookingStatus)
app.delete(`/:id`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], deleteBooking)

// Special features
app.get(`/:id/invoice`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], generateInvoice) // Society mencetak bukti
app.get(`/history/transactions`, [verifyToken, verifyRole(["OWNER"])], getBookingHistory) // Owner lihat histori

export default app
