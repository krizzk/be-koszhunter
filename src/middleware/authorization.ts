import type { NextFunction, Request, Response } from "express"
import { verify } from "jsonwebtoken"
import { SECRET } from "../global"

interface JwtPayload {
  id: number
  name: string
  email: string
  role: string
  phone_number: string
  profile_picture: string
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(403).json({
      status: false,
      message: "Access denied. No authorization header provided.",
    })
  }

  const token = authHeader.split(" ")[1]

  if (!token) {
    return res.status(403).json({
      status: false,
      message: "Access denied. Token format should be: Bearer <token>",
    })
  }

  try {
    const secretKey = SECRET || "joss"
    const decoded = verify(token, secretKey) as JwtPayload

    req.body.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      phone_number: decoded.phone_number,
      profile_picture: decoded.profile_picture,
    }

    next()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return res.status(401).json({
      status: false,
      message: `Invalid token: ${errorMessage}`,
    })
  }
}

export const verifyRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user

    if (!user) {
      return res.status(403).json({
        status: false,
        message: "No user information available.",
      })
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        status: false,
        message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}. Your role: ${user.role}`,
      })
    }

    next()
  }
}
