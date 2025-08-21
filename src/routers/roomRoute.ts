import express from "express"
import { getRoomsByKosId, getRoomById, createRoom, updateRoom, deleteRoom } from "../controllers/roomController"
import { verifyAddRoom, verifyEditRoom } from "../middleware/roomValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"
import uploadFile from "../middleware/roomUpload"

const app = express()
app.use(express.json())

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         room_number:
 *           type: string
 *         tipe:
 *           type: string
 *         room_picture:
 *           type: string
 *         fasilitas_kamar:
 *           type: string
 *         harga:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, MAINTENANCE]
 *       example:
 *         id: 1
 *         room_number: "A1"
 *         tipe: "Single"
 *         fasilitas_kamar: "AC, Kasur, Lemari"
 *         harga: 800000
 *         status: "AVAILABLE"
 * tags:
 *   name: Rooms
 *   description: Room management API
 */

/**
 * @swagger
 * /rooms/kos/{kosId}:
 *   get:
 *     summary: Get rooms by kos ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: kosId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kos ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [AVAILABLE, OCCUPIED, MAINTENANCE]
 *         description: Filter by room status
 *     responses:
 *       200:
 *         description: Rooms retrieved successfully
 */

app.get(`/kos/:kosId`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getRoomsByKosId)
app.get(`/:id`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getRoomById)

app.post(`/`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("room_picture"), verifyAddRoom], createRoom)

app.put(`/:id`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("room_picture"), verifyEditRoom], updateRoom)
app.delete(`/:id`, [verifyToken, verifyRole(["OWNER"])], deleteRoom)

export default app
