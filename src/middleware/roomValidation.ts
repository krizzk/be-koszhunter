import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema when add new room data, all required fields - hapus fasilitas_kamar */
const addDataSchema = Joi.object({
  kosId: Joi.number().required(),
  room_number: Joi.string().required(),
  tipe: Joi.string().required(),
  harga: Joi.number().min(0).required(),
  room_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

/** create schema when edit room data, all fields are optional - hapus fasilitas_kamar */
const editDataSchema = Joi.object({
  room_number: Joi.string().optional(),
  tipe: Joi.string().optional(),
  harga: Joi.number().min(0).optional(),
  status: Joi.string().valid("AVAILABLE", "OCCUPIED", "MAINTENANCE").uppercase().optional(),
  room_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

export const verifyAddRoom = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = addDataSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyEditRoom = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = editDataSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
