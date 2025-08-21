import express from "express"
import {
  getAllFacilitiesByKosId,
  getAllFacilitiesByRoomId,
  createKosFacility,
  createRoomFacility,
  updateFacility,
  deleteFacility,
} from "../controllers/facilityController"
import { verifyAddKosFacility, verifyAddRoomFacility, verifyUpdateFacility } from "../middleware/facilityValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"
import uploadFile from "../middleware/facilityIconUpload"

const app = express()
app.use(express.json())

/**
 * @swagger
 * components:
 *   schemas:
 *     Facility:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         facility_type:
 *           type: string
 *           enum: [KOS_FACILITY, ROOM_FACILITY]
 *       example:
 *         id: 1
 *         name: "WiFi"
 *         description: "Internet kecepatan tinggi"
 *         icon: "wifi-icon.png"
 *         facility_type: "KOS_FACILITY"
 * tags:
 *   name: Facilities
 *   description: Facility management API
 */

/**
 * @swagger
 * /facilities/kos/{kosId}:
 *   get:
 *     summary: Get all facilities for a kos
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: kosId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kos ID
 *     responses:
 *       200:
 *         description: Kos facilities retrieved successfully
 *
 * /facilities/room/{roomId}:
 *   get:
 *     summary: Get all facilities for a room
 *     tags: [Facilities]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Room ID
 *     responses:
 *       200:
 *         description: Room facilities retrieved successfully
 */

// Get facilities
app.get(`/kos/:kosId`, getAllFacilitiesByKosId)
app.get(`/room/:roomId`, getAllFacilitiesByRoomId)

// Create facilities
app.post(
  `/kos`,
  [verifyToken, verifyRole(["OWNER"]), uploadFile.single("icon"), verifyAddKosFacility],
  createKosFacility,
)
app.post(
  `/room`,
  [verifyToken, verifyRole(["OWNER"]), uploadFile.single("icon"), verifyAddRoomFacility],
  createRoomFacility,
)

// Update and delete facilities
app.put(`/:id`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("icon"), verifyUpdateFacility], updateFacility)
app.delete(`/:id`, [verifyToken, verifyRole(["OWNER"])], deleteFacility)

export default app
