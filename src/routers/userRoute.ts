import express from "express"
import { getAllUsers, createUser, updateUser, deleteUser, changePicture, authentication, getUserById } from "../controllers/userController"
import { verifyAddUser, verifyEditUser, verifyAuthentication } from "../middlewares/userValidation"
import uploadFile from "../middlewares/profilUpload"
import { verifyToken, verifyRole } from "../middlewares/authorization"

const app = express()
app.use(express.json())

app.get(`/`, [verifyToken, verifyRole(["ADMIN"])], getAllUsers)
app.get(`/profile`, [verifyToken, verifyRole(["USER", "ADMIN"])], getUserById)

app.post(`/create`, [uploadFile.single("profile_picture"), verifyAddUser], createUser)
app.put(`/:id`, [verifyToken, verifyRole(["USER", "ADMIN"]), uploadFile.single("profile_picture"), verifyEditUser], updateUser)
app.put(`/profile/:id`, [verifyToken, verifyRole(["USER", "ADMIN"]), uploadFile.single("profile_picture")], changePicture)
app.delete(`/:id`, [verifyToken, verifyRole(["ADMIN"])], deleteUser)

app.post(`/login`, [verifyAuthentication], authentication)


export default app

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         profile_picture:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: datetime
 *         updatedAt:
 *           type: string
 *           format: datetime
 *       example:
 *         id: 1
 *         name: kasir
 *         email: kasir@gmail.com
 *         password: c7911af3adbd12a035b289556d96470a
 *         profile_picture: 1727836764174-Picture1.png
 *         role: CASHIER
 *         createdAt: 2024-09-27T07:43:59.025Z
 *         updatedAt: 2024-10-29T09:34:34.999Z
 * tags:
 *   name: Users
 *   description: The users managing API
 * /user/login:
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
 *               email: manager@gmail.com
 *               password: "123"
 *     responses:
 *       200:
 *         description: Login Success
 * /user/profile:
 *   get:
 *     summary: get profile user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: get profile success
 * /user:
 *   get:
 *     summary: Lists all the users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The created user.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       500:
 *         description: Some server error
 * /user/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user response by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *   put:
 *    summary: Update the user by the id
 *    tags: [Users]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The user id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *    responses:
 *      200:
 *        description: The user was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *      404:
 *        description: The user was not found
 *      500:
 *        description: Some error happened
 *   delete:
 *     summary: Remove the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user id
 *
 *     responses:
 *       200:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 */