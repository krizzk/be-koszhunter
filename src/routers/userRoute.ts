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
  testToken,
} from "../controllers/userController"
import { verifyAddUser, verifyEditUser, verifyAuthentication } from "../middleware/userValidation"
import uploadFile from "../middleware/profileUpload"
import { verifyToken, verifyRole } from "../middleware/authorization"

const app = express()
app.use(express.json())

// User management routes
app.get(`/`, [verifyToken, verifyRole(["OWNER"])], getAllUsers)
app.get(`/profile`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getUserById)
app.post(`/create`, [uploadFile.single("profile_picture"), verifyAddUser], createUser)
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

// Test endpoint untuk debug token - TANPA middleware role
app.get(`/test-token`, [verifyToken], testToken)

// Dashboard routes
app.get(`/dashboard`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getDashboard)
app.get(`/popular-kos`, [verifyToken, verifyRole(["SOCIETY", "OWNER"])], getPopularKos)

export default app
