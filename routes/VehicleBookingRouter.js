import express from "express";
import {
    createBooking,
    getAllBookings,
    getUserBookings,
    getBookingById,
    updateBookingStatus,
    cancelBooking,
    hardDeleteBooking,
    getBookingStats
} from "../controllers/VehicleBookingController.js";
import { verifyToken } from "../middleware/auth1.js";

const vehicleBookingRouter = express.Router();

// Public routes (no authentication required)
vehicleBookingRouter.post("/", createBooking);  // Create a new booking
vehicleBookingRouter.get("/user", getUserBookings);  // Get bookings by email
vehicleBookingRouter.get("/:id", getBookingById);  // Get single booking by ID

// Hard Delete - Permanently remove booking (Public access - no auth required)
// For production, you may want to add authentication
vehicleBookingRouter.delete("/:id/permanent", hardDeleteBooking);

// Soft Delete - Just update status to cancelled
vehicleBookingRouter.put("/:id/cancel", cancelBooking);

// Protected routes (require authentication - admin only)
vehicleBookingRouter.get("/", verifyToken, getAllBookings);  // Admin - get all bookings
vehicleBookingRouter.get("/stats", verifyToken, getBookingStats);  // Admin - statistics
vehicleBookingRouter.put("/:id/status", verifyToken, updateBookingStatus);  // Admin - update status

export default vehicleBookingRouter;