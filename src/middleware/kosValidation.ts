import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema when add new kos data, all required fields - hapus fasilitas_umum */
const addDataSchema = Joi.object({
  name: Joi.string().required(),
  alamat: Joi.string().required(),
  description: Joi.string().optional(),
  peraturan_kos: Joi.string().optional(),
  gender_type: Joi.string().valid("PUTRA", "PUTRI", "CAMPUR").uppercase().required(),
  total_rooms: Joi.number().min(1).required(),
  kos_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

/** create schema when edit kos data, all fields are optional - hapus fasilitas_umum */
const editDataSchema = Joi.object({
  name: Joi.string().optional(),
  alamat: Joi.string().optional(),
  description: Joi.string().optional(),
  peraturan_kos: Joi.string().optional(),
  gender_type: Joi.string().valid("PUTRA", "PUTRI", "CAMPUR").uppercase().optional(),
  total_rooms: Joi.number().min(1).optional(),
  kos_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

export const verifyAddKos = (request: Request, response: Response, next: NextFunction) => {
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

export const verifyEditKos = (request: Request, response: Response, next: NextFunction) => {
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
