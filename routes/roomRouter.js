import express from "express"
import { authMiddleware } from "../middleware/auth.js";
import { 
    addRoom, 
    deleteRoom, 
    getRooms, 
    updateRoom, 
    getRoomById, 
    searchRoomsByDate, 
    getRoomsByHotel,
    bookRoom,
    updateAvailability,
    confirmRoomBooking,
    cancelRoomBooking
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// Public routes - Available for all users
roomRouter.get("/", getRooms);
roomRouter.get("/search", searchRoomsByDate);
roomRouter.get("/hotel/:hotelName", getRoomsByHotel);   // ✅ moved ABOVE /:key
roomRouter.get("/:key", getRoomById);

// Booking route - Login required
roomRouter.post("/:key/book", authMiddleware, bookRoom);

// Admin only routes
roomRouter.post("/", authMiddleware, addRoom);
roomRouter.put("/:key", authMiddleware, updateRoom);
roomRouter.put("/:key/availability", authMiddleware, updateAvailability);
roomRouter.delete("/:key", authMiddleware, deleteRoom);

// Payment integration routes
roomRouter.post("/confirm-booking", authMiddleware, confirmRoomBooking);
roomRouter.post("/cancel-booking", authMiddleware, cancelRoomBooking);

export default roomRouter;

//customer
// "email": "kusal1@example.com",
// "password": "123",

//Admin
// "email": "kusal2@example.com",
// "password": "123",

//MONGO_URL=mongodb+srv://admin_36:1234@cluster0.rawrfc0.mongodb.net/HotelManagement?appName=Cluster0