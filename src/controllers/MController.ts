import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { BASE_URL } from "../global";
import fs from "fs"

const prisma = new PrismaClient({ errorFormat: "pretty" })

export const getAllMotorbike = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { search } = request.query

        /** process to get motor, contains means search name of motor based on sent keyword */
        const allmotors = await prisma.motorbike.findMany({
            where: { name: { contains: search?.toString() || "" } }
        })

        return response.json({
            status: true,
            data: allmotors,
            message: `motors has retrieved`
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

export const createM = async (request: Request, response: Response) => {
    try {
        /** get requested data (data has been sent from request) */
        const { name, brand, Class, price, tax, kilometer, BPKB, STNK, description, } = request.body
        const uuid = uuidv4()

        /** variable filename use to define of uploaded file name */
        let filename = ""
        if (request.file) filename = request.file.filename /** get file name of uploaded file */

        /** process to save new motor, price and stock have to convert in number type */
        const newM = await prisma.motorbike.create({
            data: { uuid, name, brand, Class, price: Number(price),tax, kilometer, BPKB, STNK, description, motorbike_picture: filename }
        })

        return response.json({
            status: true,
            data: newM,
            message: `New motor has created`
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

export const updateM = async (request: Request, response: Response) => {
    try {
        /** get id of motor's id that sent in parameter of URL */
        const { id } = request.params
        /** get requested data (data has been sent from request) */
        const { name, brand, Class, price, tax,kilometer,BPKB, STNK, description } = request.body

        /** make sure that data is exists in database */
        const findM = await prisma.motorbike.findFirst({ where: { id: Number(id) } })
        if (!findM) return response
            .status(200)
            .json({ status: false, message: `motor is not found` })

        /** default value filename of saved data */
        let filename = findM.motorbike_picture
        if (request.file) {
            /** update filename by new uploaded picture */
            filename = request.file.filename
            /** check the old picture in the folder */
            let path = `${BASE_URL}/../public/motorbike_picture/${findM.motorbike_picture}`
            let exists = fs.existsSync(path)
            /** delete the old exists picture if reupload new file */
            if(exists && findM.motorbike_picture !== ``) fs.unlinkSync(path)
        }

        /** process to update motor's data */
        const updatedM = await prisma.motorbike.update({
            data: {
                name: name || findM.name,
                brand: brand || findM.brand,
                Class: Class || findM.Class,
                price: price ? Number(price) : findM.price,
                tax: tax || findM.tax,
                kilometer: kilometer || findM.kilometer,
                BPKB: BPKB || findM.BPKB,
                STNK: STNK || findM.STNK,
                description: description || findM.description,
                motorbike_picture: filename
            },
            where: { id: Number(id) }
        })

        return response.json({
            status: true,
            data: updatedM,
            message: `motor has updated`
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

export const deleteM = async (request: Request, response: Response) => {
    try {
        /** get id of motor's id that sent in parameter of URL */
        const { id } = request.params
        
        /** make sure that data is exists in database */
        const findM = await prisma.motorbike.findFirst({ where: { id: Number(id) } })
        if (!findM) return response
            .status(200)
            .json({ status: false, message: `motor with ${id} is not found` })

        /** check the old picture in the folder */
        let path = `${BASE_URL}/../public/motorbike_picture/${findM.motorbike_picture}`
        let exists = fs.existsSync(path)
        /** delete the old exists picture if reupload new file */
        if(exists && findM.motorbike_picture !== ``) fs.unlinkSync(path)

        /** process to delete motor's data */
        const deletedmotor = await prisma.motorbike.delete({
            where: { id: Number(id) }
        })
        return response.json({
            status: true,
            data: deletedmotor,
            message: `motor with ${id} has deleted`
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


//GET motor BY ID
export const getMotorById = async (request: Request, response: Response) => {
    try {
        /** Ambil data id dari request */
        const { id } = request.params;

        /** Proses untuk mendapatkan motor berdasarkan ID */
        const motor = await prisma.motorbike.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        /** Periksa apakah motor ada */
        if (!motor) {
            return response
                .json({
                    status: false,
                    message: `motor dengan ID ${id} tidak ditemukan`
                })
                .status(404);
        }

        return response.json({
            status: true,
            data: motor,
            message: `motor telah berhasil diambil`
        }).status(200);
    } catch (error) {
        return response
            .json({
                status: false,
                message: `Terjadi kesalahan: ${error}`
            })
            .status(400);
    }
};
