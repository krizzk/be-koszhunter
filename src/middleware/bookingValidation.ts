import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema when add new booking data */
const addDataSchema = Joi.object({
  roomId: Joi.number().required(),
  start_date: Joi.date().iso().required(),
  end_date: Joi.date().iso().greater(Joi.ref("start_date")).required(),
  notes: Joi.string().allow("").optional(),
  user: Joi.optional(),
})

/** create schema when edit booking status */
const editStatusSchema = Joi.object({
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED").uppercase().required(),
  user: Joi.optional(),
})

/** create schema when edit booking data */
const editDataSchema = Joi.object({
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  notes: Joi.string().allow("").optional(),
  status: Joi.string().valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED").uppercase().optional(),
  user: Joi.optional(),
}).custom((value, helpers) => {
  // Custom validation to ensure end_date is after start_date if both are provided
  if (value.start_date && value.end_date && value.end_date <= value.start_date) {
    return helpers.error("any.invalid", { message: "end_date must be after start_date" })
  }
  return value
})

export const verifyAddBooking = (request: Request, response: Response, next: NextFunction) => {
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

export const verifyEditBookingStatus = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = editStatusSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyEditBooking = (request: Request, response: Response, next: NextFunction) => {
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
