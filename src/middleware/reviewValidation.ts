import type { NextFunction, Request, Response } from "express"
import Joi from "joi"

/** create schema for adding a review */
const addReviewSchema = Joi.object({
  kosId: Joi.number().required(),
  content: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  user: Joi.optional(),
})

/** create schema for replying to a review */
const replyReviewSchema = Joi.object({
  reply_content: Joi.string().required(),
  user: Joi.optional(),
})

export const verifyAddReview = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = addReviewSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}

export const verifyReplyReview = (request: Request, response: Response, next: NextFunction) => {
  /** validate a request body and grab error if exist */
  const { error } = replyReviewSchema.validate(request.body, { abortEarly: false })

  if (error) {
    /** if there is an error, then give a response like this */
    return response.status(400).json({
      status: false,
      message: error.details.map((it) => it.message).join(),
    })
  }
  return next()
}
