import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      users?: {
        id: string
        name: string
        email: string
        role: string
        phone_number: string
        profile_picture: string
      }
    }
  }
}

// export interface KosData {
//   id: number
//   uuid: string
//   name: string
//   alamat: string
//   kos_picture: string
//   description: string
//   peraturan_kos: string
//   fasilitas_umum: string
//   gender_type: "PUTRA" | "PUTRI" | "CAMPUR"
//   available_rooms: number
//   total_rooms: number
//   ownerId: number
// }

// export interface RoomData {
//   id: number
//   uuid: string
//   room_number: string
//   tipe: string
//   room_picture: string
//   fasilitas_kamar: string
//   harga: number
//   status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
//   kosId: number
// }

// export interface BookingData {
//   id: number
//   uuid: string
//   start_date: Date
//   end_date: Date
//   total_price: number
//   status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
//   notes: string
//   userId: number
//   roomId: number
// }

// export interface UserData {
//   id: number
//   uuid: string
//   name: string
//   email: string
//   profile_picture: string
//   role: "OWNER" | "USER"
//   phone_number: string
// }
