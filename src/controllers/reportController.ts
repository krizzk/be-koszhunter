import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getDashboard = async (request: Request, response: Response) => {
    try {
        /** process to get order, contains means search name or table number of customer's order based on sent keyword */
        const allUsers = await prisma.user.findMany()
        const allMotors = await prisma.motorbike.findMany()
        const newOrders = await prisma.order.findMany({
            where: {
                OR: [
                    { status: "NEW" }
                ]},
        })
        const doneOrders = await prisma.order.findMany({
            where: {status:  'DONE'},
        })
        return response.json({
            status: true,
            data: {
                allUser: allUsers.length,
                allMotors: allMotors.length,
                newOrder: newOrders.length,
                doneOrder: doneOrders.length,
            },
            message: `Order list has retrieved`
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

export const getFavourite = async (request: Request, response: Response) => {
    try {
        // Mengambil semua order list yang ada
        const orderLists = await prisma.orderList.findMany({
            include: {
                Motorbike: true, // Mengambil informasi motorbike
            },
        });

        // Membuat objek untuk menyimpan jumlah pemesanan per brand
        const brandCount: { [key: string]: number } = {};

        // Menghitung jumlah pemesanan untuk setiap brand
        orderLists.forEach(orderList => {
            const brandName = orderList.Motorbike?.brand; // Nama brand
            if (brandName) {
                if (!brandCount[brandName]) {
                    brandCount[brandName] = 0; // Inisialisasi jika belum ada
                }
                brandCount[brandName] += orderList.quantity; // Menambahkan jumlah pemesanan
            }
        });

        // Mengubah objek menjadi array untuk dikirim sebagai respons
        const result = Object.keys(brandCount).map(brandName => {
            return {
                brand: brandName,
                count: brandCount[brandName],
                price: orderLists.find(orderList => orderList.Motorbike?.brand === brandName)?.Motorbike?.price || 0,
                motorbike_picture: orderLists.find(orderList => orderList.Motorbike?.brand === brandName)?.Motorbike?.motorbike_picture || "",
            };
        });

        return response.json({
            status: true,
            data: result,
            message: "All report brands are retrieved",
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `There is an error. ${error}`
            })
            .status(400);
    }
}
