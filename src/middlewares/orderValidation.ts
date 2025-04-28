import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

/** create schema for detail of orderlist */
const orderListSchema = Joi.object({
    motorId: Joi.number().required(),
    quantity: Joi.number().optional(),
    note: Joi.string().allow("").optional(), // Allow empty string
  })
  
  /** create schema when add new order's data */
  const addDataSchema = Joi.object({
    // customer: Joi.string().required(),
    payment_method: Joi.string().valid("CASH", "BANK").uppercase().required(),
    status: Joi.string().valid("NEW","DONE").uppercase().required(),
    userId: Joi.number().optional(),
    address: Joi.string().allow("").required(), // Allow empty string
    orderlists: Joi.array().items(orderListSchema).min(1).required(),
    user: Joi.optional(),
  })
  
  /** create schema when edit status order's data */
  const editDataSchema = Joi.object({
    status: Joi.string().valid("NEW","DONE").uppercase().required(),
    user: Joi.optional(),
  })
  
  export const verifyAddOrder = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })
  
    if (error) {
      /** if there is an error, then give a response like this */
      return response.status(400).json({
        status: false,
        message: error.details.map((it) => it.message).join(),
      })
    }
  
    // Convert table_number to string if it's a number
    if (typeof request.body.table_number === "number") {
      request.body.table_number = String(request.body.table_number)
    }
  
    return next()
  }
  
  export const verifyEditStatus = (request: Request, response: Response, next: NextFunction) => {
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
