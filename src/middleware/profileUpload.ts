import type { Request } from "express"
import multer from "multer"
import { BASE_URL } from "../global"
import type { Express } from "express"

/** define storage configuration of profile image  */
const storage = multer.diskStorage({
  destination: (
    request: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void,
  ) => {
    /** define location of uploaded image, make sure that you have create a "public" folder in root folder.
     * then create folder "profile_picture" inside of "public folder"
     */
    cb(null, `${BASE_URL}/public/profile_picture/`)
  },
  filename: (request: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    /** define file name of uploaded file */
    cb(null, `${new Date().getTime().toString()}-${file.originalname}`)
  },
})

const uploadFile = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 } /** define max size of uploaded file, in this case max size is 2 MB */,
})

export default uploadFile
