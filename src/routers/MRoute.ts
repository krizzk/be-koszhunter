import express from "express"
import { getAllMotorbike, createM, updateM, deleteM, getMotorById } from "../controllers/MController"
import { verifyAddM, verifyEditM } from "../middlewares/MValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/menuUpload"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["ADMIN","USER"])], getAllMotorbike)

app.get(`/getMotorById/:id`, [verifyToken, verifyRole(["ADMIN","USER"])], getMotorById)

app.post(`/createM`, [verifyToken, verifyRole(["ADMIN"]), uploadFile.single("motorbike_picture"), verifyAddM], createM)
app.put(`/:id`, [verifyToken, verifyRole(["ADMIN"]), uploadFile.single("motorbike_picture"), verifyEditM], updateM)
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteM)

export default app