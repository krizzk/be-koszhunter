import express from "express"
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  changePicture,
  authentication,
  getUserById,
  getDashboard,
  getPopularKos,
} from "../controllers/userController"
import { verifyAddUser, verifyEditUser, verifyAuthentication } from "../middleware/userValidation"
import uploadFile from "../middleware/profileUpload"
import { verifyToken, verifyRole } from "../middleware/authorization"

const app = express()
app.use(express.json())

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         profile_picture:
 *           type: string
 *         role:
 *           type: string
 *           enum: [OWNER, SOCIETY]
 *         phone_number:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: datetime
 *         updatedAt:
 *           type: string
 *           format: datetime
 *       example:
 *         id: 1
 *         name: "John Doe"
 *         email: "john@gmail.com"
 *         role: "SOCIETY"
 *         phone_number: "08123456789"
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login User
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "user@gmail.com"
 *               password: "123"
 *     responses:
 *       200:
 *         description: Login Success
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 * /users:
 *   get:
 *     summary: Get all users (OWNER only)
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [OWNER, SOCIETY]
 *               phone_number:
 *                 type: string
 *               profile_picture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User created successfully
 */

// User management routes
app.get(`/`, [verifyToken, verifyRole(["OWNER"])], getAllUsers)
app.get(`/profile`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getUserById)

app.post(`/`, [uploadFile.single("profile_picture"), verifyAddUser], createUser)
app.put(
  `/:id`,
  [verifyToken, verifyRole(["SOCIETY", "OWNER"]), uploadFile.single("profile_picture"), verifyEditUser],
  updateUser,
)
app.put(
  `/profile/:id`,
  [verifyToken, verifyRole(["SOCIETY", "OWNER"]), uploadFile.single("profile_picture")],
  changePicture,
)
app.delete(`/:id`, [verifyToken, verifyRole(["OWNER"])], deleteUser)

app.post(`/login`, [verifyAuthentication], authentication)

// Dashboard routes - dipindahkan dari reports
app.get(`/dashboard`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getDashboard)
app.get(`/popular-kos`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getPopularKos)

export default app
