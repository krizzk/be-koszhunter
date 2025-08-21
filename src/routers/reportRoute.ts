import express from "express"
import { getDashboard, getPopularKos, getRevenueReport, getBookingTrends } from "../controllers/reportController"
import { verifyRole, verifyToken } from "../middleware/authorization"

const app = express()
app.use(express.json())

// Society dan Owner dapat melihat dashboard
app.get(`/dashboard`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getDashboard)
app.get(`/popular-kos`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getPopularKos)

// Hanya Owner yang dapat melihat laporan revenue dan trends
app.get(`/revenue`, [verifyToken, verifyRole(["OWNER"])], getRevenueReport)
app.get(`/booking-trends`, [verifyToken, verifyRole(["OWNER"])], getBookingTrends)

export default app
