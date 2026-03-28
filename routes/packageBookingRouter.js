import express from "express";
import {
    createPackageBooking,
    getPackageBookings,
    getMyBookings,
    getPackageBookingById,
    updatePackageBookingStatus,
    deletePackageBooking,
} from "../controllers/packageBookingController.js";

const packageBookingRouter = express.Router();

packageBookingRouter.post("/",                      createPackageBooking);
packageBookingRouter.get("/my",                     getMyBookings);
packageBookingRouter.get("/",                       getPackageBookings);
packageBookingRouter.get("/:bookingId",             getPackageBookingById);
packageBookingRouter.put("/:bookingId/status",      updatePackageBookingStatus);
packageBookingRouter.delete("/:bookingId",          deletePackageBooking);

export default packageBookingRouter;
