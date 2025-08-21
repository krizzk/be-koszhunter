import path from "path";
/** define path (address) of root folder */
export const BASE_URL = `${path.join(__dirname, "../")}`
export const PORT = process.env.PORT
export const SECRET = process.env.SECRET

// export const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_API_SERVER_KEY
// export const MIDTRANS_API_URL = process.env.MIDTRANS_API_URL
// export const MIDTRANS_APP_URL = process.env.MIDTRANS_APP_URL
// export const FRONT_END_URL = process.env.FRONTEND_URL