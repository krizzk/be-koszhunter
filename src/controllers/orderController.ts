import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllOrders = async (request: Request, response: Response) => {
  try {
    /** get requested data (data has been sent from request) */
    const { search } = request.query;

    /** process to get order, search based on user or address */
    const allOrders = await prisma.order.findMany({
      where: {
        OR: [
          { address: { contains: search?.toString() || "" } },
          { User: { name: { contains: search?.toString() || "" } } }
        ]
      },
      orderBy: { createdAt: "desc" }, /** sort by descending order date */
      include: { 
        User: true,
        orderLists: {
          include: { Motorbike: true }
        }
      }
    });
    return response.json({
      status: true,
      data: allOrders,
      message: `Order list has been retrieved`
    }).status(200);
  } catch (error) {
    return response
      .json({
        status: false,
        message: `There is an error. ${error}`
      })
      .status(400);
  }
};

export const createOrder = async (request: Request, response: Response) => {
  try {
    /** get requested data (data has been sent from request) */
    const { payment_method, status, orderlists, address } = request.body
    const user = request.body.user
    const uuid = uuidv4()
    /**
     * assume that "orderlists" is an array of object that has keys:
     * motorId, quantity, note
     * */
  
    /** loop details of order to check menu and count the total price */
    let total_price = 0
    for (let index = 0; index < orderlists.length; index++) {
    const { motorId, quantity } = orderlists[index]
    const detailMenu = await prisma.motorbike.findFirst({
      where: {
      id: motorId,
      },
    })
    if (!detailMenu)
      return response.status(200).json({ status: false, message: `Menu with id ${motorId} is not found` })
    total_price += detailMenu.price * (quantity || 1) // Multiply by quantity, default to 1 if not provided
    }
  
    /** process to save new order */
    const newOrder = await prisma.order.create({
    data: {
      uuid,
      total_price,
      payment_method,
      status,
      address,
      userId: user.id,
    },
    })
  
    /** loop details of Order to save in database */
    for (let index = 0; index < orderlists.length; index++) {
    const uuid = uuidv4()
    const { motorId, note, quantity } = orderlists[index]
    await prisma.orderList.create({
      data: {
      uuid,
      orderId: newOrder.id,
      MotorbikeId: Number(motorId),
      note: note || "", // Ensure note is never null
      quantity: quantity || 1, // Save quantity, default to 1 if not provided
      },
    })
    }
    return response
    .json({
      status: true,
      data: newOrder,
      message: `New Order has created`,
    })
    .status(200)
  } catch (error) {
    return response
    .json({
      status: false,
      message: `There is an error. ${error}`,
    })
    .status(400)
  }
  }

export const updateStatusOrder = async (request: Request, response: Response) => {
    try {
        /** get id of order's id that sent in parameter of URL */
        const { id } = request.params
        /** get requested data (data has been sent from request) */
        const { status } = request.body
        const user = request.body.user

        /** make sure that data is exists in database */
        const findOrder = await prisma.order.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return response
            .status(200)
            .json({ status: false, message: `Order is not found` })

        /** process to update menu's data */
        const updatedStatus = await prisma.order.update({
            data: {
                status: status || findOrder.status,
                userId: user.id ? user.id : findOrder.userId
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedStatus,
            message: `Order has updated`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}

export const deleteOrder = async (request: Request, response: Response) => {
    try {
        /** get id of order's id that sent in parameter of URL */
        const { id } = request.params

        /** make sure that data is exists in database */
        const findOrder = await prisma.order.findFirst({ where: { id: Number(id) } })
        if (!findOrder) return response
            .status(200)
            .json({ status: false, message: `Order is not found` })

        /** process to delete details of order */
        let deleteOrderList = await prisma.orderList.deleteMany({ where: { orderId: Number(id) } })
        /** process to delete of Order */
        let deleteOrder = await prisma.order.delete({ where: { id: Number(id) } })

        return response.json({
            status: true,
            data: deleteOrder,
            message: `Order has deleted`
        }).status(200)
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400)
    }
}


//GET ORDEER BY ID
export const getOrderById = async (request: Request, response: Response) => {
  try {
      /** get requested data (id has been sent from request) */
      const { id } = request.params;

      /** process to get order by ID */
      const order = await prisma.order.findUnique({
          where: {
              id: parseInt(id)
          },
          include: {
              User: true,
              orderLists: {
                  include: { Motorbike: true }
              }
          }
      });

      /** check if the order exists */
      if (!order) {
          return response
              .json({
                  status: false,
                  message: `Order with ID ${id} not found`
              })
              .status(404);
      }

      return response.json({
          status: true,
          data: order,
          message: `Order has been retrieved`
      }).status(200);
  } catch (error) {
      return response
          .json({
              status: false,
              message: `There is an error. ${error}`
          })
          .status(400);
  }
};
