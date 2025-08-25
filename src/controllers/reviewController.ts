import type { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { v4 as uuidv4 } from "uuid"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllReviewsByKosId = async (request: Request, response: Response) => {
  try {
    const { kosId } = request.params

    const reviews = await prisma.review.findMany({
      where: { kosId: Number(kosId) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return response.json({
      status: true,
      data: reviews,
      message: "Reviews retrieved successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const createReview = async (request: Request, response: Response) => {
  try {
    const { kosId, content, rating } = request.body
    const user = request.body.user
    const uuid = uuidv4()

    // Check if user exists
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if kos exists
    const kos = await prisma.kos.findUnique({
      where: { id: Number(kosId) },
    })

    if (!kos) {
      return response.status(404).json({
        status: false,
        message: "Kos not found",
      })
    }

    // Check if user has already reviewed this kos
    const existingReview = await prisma.review.findFirst({
      where: {
        kosId: Number(kosId),
        userId: Number(user.id),
      },
    })

    if (existingReview) {
      return response.status(400).json({
        status: false,
        message: "You have already reviewed this kos",
      })
    }

    // Create review
    const newReview = await prisma.review.create({
      data: {
        uuid,
        content,
        rating: Number(rating),
        kosId: Number(kosId),
        userId: Number(user.id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return response.status(201).json({
      status: true,
      data: newReview,
      message: "Review created successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const replyToReview = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const { reply_content } = request.body
    const user = request.body.user

    // Check if user exists
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if user is an owner
    if (user.role !== "OWNER") {
      return response.status(403).json({
        status: false,
        message: "Only owners can reply to reviews",
      })
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
      },
    })

    if (!review) {
      return response.status(404).json({
        status: false,
        message: "Review not found",
      })
    }

    // Check if the owner owns the kos
    if (review.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only reply to reviews for your own kos",
      })
    }

    // Update review with reply
    const updatedReview = await prisma.review.update({
      where: { id: Number(id) },
      data: {
        reply_content,
        reply_at: new Date(),
        ownerId: Number(user.id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        owner: {
          select: {
            id: true,
            name: true,
            profile_picture: true,
          },
        },
        kos: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return response.json({
      status: true,
      data: updatedReview,
      message: "Reply added successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}

export const deleteReview = async (request: Request, response: Response) => {
  try {
    const { id } = request.params
    const user = request.body.user

    // Check if user exists
    if (!user) {
      return response.status(401).json({
        status: false,
        message: "User not authenticated. Please login first.",
      })
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id: Number(id) },
      include: {
        kos: true,
      },
    })

    if (!review) {
      return response.status(404).json({
        status: false,
        message: "Review not found",
      })
    }

    // Check if the user is the author or the kos owner
    if (review.userId !== Number(user.id) && review.kos.ownerId !== Number(user.id)) {
      return response.status(403).json({
        status: false,
        message: "You can only delete your own reviews or reviews for your kos",
      })
    }

    // Delete review
    const deletedReview = await prisma.review.delete({
      where: { id: Number(id) },
    })

    return response.json({
      status: true,
      data: deletedReview,
      message: "Review deleted successfully",
    })
  } catch (error) {
    return response.status(400).json({
      status: false,
      message: `There is an error. ${error}`,
    })
  }
}
