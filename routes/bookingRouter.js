import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getUserBookings,
  cancelBooking,
  getBookingsByStatus,
  verifyPayment,
  updateBookingPayment
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

/* ========= USER ========= */
bookingRouter.post("/", authMiddleware, createBooking);
bookingRouter.get("/user/my-bookings", authMiddleware, getUserBookings);
bookingRouter.put("/:bookingId/cancel", authMiddleware, cancelBooking);

/* ========= PAYMENT ========= */
bookingRouter.put("/payment/update", authMiddleware, updateBookingPayment);

/* ========= ADMIN ========= */
bookingRouter.get("/admin/all-bookings", authMiddleware, getAllBookings);
bookingRouter.get("/admin/status/:status", authMiddleware, getBookingsByStatus);
bookingRouter.put("/admin/:bookingId/verify", authMiddleware, verifyPayment);

/* ========= DYNAMIC LAST ========= */
bookingRouter.get("/:bookingId", getBookingById);

export default bookingRouter;