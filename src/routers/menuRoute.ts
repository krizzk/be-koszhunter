import express from "express"
import { getAllMenus, createMenu, updateMenu, deleteMenu, getMenuById } from "../controllers/menuController"
import { verifyAddMenu, verifyEditMenu } from "../middlewares/menuValidation"
import { verifyRole, verifyToken } from "../middlewares/authorization"
import uploadFile from "../middlewares/menuUpload"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getAllMenus)

app.get(`/getMenuById/:id`, [verifyToken, verifyRole(["CASHIER", "MANAGER"])], getMenuById)

app.post(`/`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyAddMenu], createMenu)
app.put(`/:id`, [verifyToken, verifyRole(["MANAGER"]), uploadFile.single("picture"), verifyEditMenu], updateMenu)
app.delete(`/:id`, [verifyToken, verifyRole(["MANAGER"])], deleteMenu)

export default app