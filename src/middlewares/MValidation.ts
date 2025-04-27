import { BPKB, Brand, Class, kilometer } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import Joi from 'joi'

/** create schema when add new menu's data, all of fileds have to be required */
const addDataSchema = Joi.object({
    name: Joi.string().required(),
    brand: Joi.string().valid('HONDA','YAMAHA','SUZUKI','KAWASAKI','DUCATI','KTM','BMW','APRILIA','HARLEY_DAVIDSON','TRIUMPH').required(),
    Class: Joi.string().valid('CC_150_225','CC_250_UP').uppercase().required(),
    price: Joi.number().min(0).required(),
    tax: Joi.string().required(),
    kilometer: Joi.string().valid('KM0_KM900','KM1000_KM2999','KM3000_KM4999','KM5000_KM6999','KM7000_UP').required(),
    BPKB: Joi.string().valid('YES','NO').required(),
    STNK: Joi.string().valid('YES','NO').required(),
    description: Joi.string().optional(),
    motorbike_picture: Joi.allow().optional(),
    user: Joi.optional()
})

/** create schema when edit new menu's data, all of fileds have to be required */
const editDataSchema = Joi.object({
    name: Joi.string().optional(),
    brand: Joi.string().valid('HONDA','YAMAHA','SUZUKI','KAWASAKI','DUCATI','KTM','BMW','APRILIA','HARLEY_DAVIDSON','TRIUMPH').optional(),
    Class: Joi.string().valid('CC_150_225','CC_250_UP').uppercase().optional(),
    price: Joi.number().min(0).optional(),
    tax: Joi.string().optional(),
    kilometer: Joi.string().valid('KM0_KM900','KM1000_KM2999','KM3000_KM4999','KM5000_KM6999','KM7000_UP').optional(),
    BPKB: Joi.string().valid('YES','NO').optional(),
    STNK: Joi.string().valid('YES','NO').optional(),
    description: Joi.string().optional(),
    motorbike_picture: Joi.allow().optional(),
    user: Joi.optional()
})


export const verifyAddM = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = addDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}

export const verifyEditM = (request: Request, response: Response, next: NextFunction) => {
    /** validate a request body and grab error if exist */
    const { error } = editDataSchema.validate(request.body, { abortEarly: false })

    if (error) {
        /** if there is an error, then give a response like this */
        return response.status(400).json({
            status: false,
            message: error.details.map(it => it.message).join()
        })
    }
    return next()
}