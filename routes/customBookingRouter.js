import express from "express";
import {
    createCustomBooking,
    getCustomBookings,
    getCustomBookingById,
    updateBookingStatus,
    deleteCustomBooking,
} from "../controllers/customPackageController.js";

const customBookingRouter = express.Router();

customBookingRouter.post("/",                      createCustomBooking);
customBookingRouter.get("/",                       getCustomBookings);
customBookingRouter.get("/:bookingId",             getCustomBookingById);
customBookingRouter.put("/:bookingId/status",      updateBookingStatus);
customBookingRouter.delete("/:bookingId",          deleteCustomBooking);

export default customBookingRouter;
