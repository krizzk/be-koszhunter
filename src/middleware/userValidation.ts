import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema when add new user's data, all of fields have to be required */
const addDataSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
  phone_number: Joi.string().min(10).required(),
  role: Joi.string().valid("OWNER", "SOCIETY").uppercase().required(),
  profile_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

/** create schema when edit user's data, all of fields are optional */
const editDataSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(3).alphanum().optional(),
  phone_number: Joi.string().min(10).optional(),
  role: Joi.string().valid("OWNER", "SOCIETY").uppercase().optional(),
  profile_picture: Joi.allow().optional(),
  user: Joi.optional(),
})

/** create schema when authentication */
const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).alphanum().required(),
})

export const verifyAddUser = (request: Request, response: Response, next: NextFunction) => {
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

export const verifyEditUser = (request: Request, response: Response, next: NextFunction) => {
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

export const verifyAuthentication = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = authSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
