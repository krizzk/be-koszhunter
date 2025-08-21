import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema for adding a kos facility */
const addKosFacilitySchema = Joi.object({
  kosId: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  user: Joi.optional(),
})

/** create schema for adding a room facility */
const addRoomFacilitySchema = Joi.object({
  roomId: Joi.number().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  user: Joi.optional(),
})

/** create schema for updating a facility */
const updateFacilitySchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  user: Joi.optional(),
})

export const verifyAddKosFacility = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = addKosFacilitySchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyAddRoomFacility = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = addRoomFacilitySchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyUpdateFacility = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = updateFacilitySchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
