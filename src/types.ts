declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        name: string
        email: string
        role: "OWNER" | "SOCIETY"
        phone_number: string
        profile_picture: string
      }
    }
  }
}

export interface KosData {
  id: number
  uuid: string
  name: string
  alamat: string
  kos_picture: string
  description: string
  peraturan_kos: string
  fasilitas_umum: string
  gender_type: "PUTRA" | "PUTRI" | "CAMPUR"
  available_rooms: number // Otomatis dari room dengan status AVAILABLE
  total_rooms: number // Otomatis dari jumlah room yang dibuat
  ownerId: number
}

export interface RoomData {
  id: number
  uuid: string
  room_number: string
  tipe: string
  room_picture: string
  fasilitas_kamar: string
  harga: number
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE"
  kosId: number
}

export interface BookingData {
  id: number
  uuid: string
  start_date: Date
  end_date: Date
  total_price: number
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  notes: string
  invoice_number: string
  invoice_pdf: string
  userId: number
  roomId: number
}

export interface UserData {
  id: number
  uuid: string
  name: string
  email: string
  profile_picture: string
  role: "OWNER" | "SOCIETY"
  phone_number: string
}

export interface ReviewData {
  id: number
  uuid: string
  content: string
  rating: number
  reply_content?: string
  reply_at?: Date
  userId: number
  kosId: number
  ownerId?: number
}

export interface FacilityData {
  id: number
  uuid: string
  name: string
  description: string
  icon: string
  facility_type: "KOS_FACILITY" | "ROOM_FACILITY"
  kosId?: number
  roomId?: number
}
