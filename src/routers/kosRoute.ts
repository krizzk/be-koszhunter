import express from "express"
import { getAllKos, createKos, updateKos, deleteKos, getKosById } from "../controllers/kosController"
import { verifyAddKos, verifyEditKos } from "../middleware/kosValidation"
import { verifyRole, verifyToken } from "../middleware/authorization"
import uploadFile from "../middleware/kosUpload"

const app = express()
app.use(express.json())

// Society dan Owner dapat melihat daftar kos
app.get(`/`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getAllKos)
app.get(`/:id`, [verifyToken, verifyRole(["OWNER", "SOCIETY"])], getKosById)

// Hanya Owner yang dapat membuat, update, dan delete kos
app.post(`/`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("kos_picture"), verifyAddKos], createKos)
app.put(`/:id`, [verifyToken, verifyRole(["OWNER"]), uploadFile.single("kos_picture"), verifyEditKos], updateKos)
app.delete(`/:id`, [verifyToken, verifyRole(["OWNER"])], deleteKos)

export default app
