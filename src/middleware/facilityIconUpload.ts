import type { Request } from "express"
import multer from "multer"
import { BASE_URL } from "../global"
import type { Express } from "express"

/** define storage configuration for facility icons */
const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    /** define location of uploaded icons */
    cb(null, `${BASE_URL}/public/facility_icons/`)
  },
  filename: (request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    /** define file name of uploaded file */
    cb(null, `${new Date().getTime().toString()}-${file.originalname}`)
  },
})

const uploadFile = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } /** max size 2 MB */,
})

export default uploadFile
