import express from "express";
import {
    createPackageBooking,
    getPackageBookings,
    getMyBookings,
    getPackageBookingById,
    updatePackageBookingStatus,
    deletePackageBooking,
    getCancelledNotifications,
    markNotificationRead,
} from "../controllers/packageBookingController.js";

const packageBookingRouter = express.Router();

packageBookingRouter.post("/",                              createPackageBooking);
packageBookingRouter.get("/my",                            getMyBookings);
packageBookingRouter.get("/cancelled-notifications",       getCancelledNotifications);
packageBookingRouter.patch("/:bookingId/mark-notified",    markNotificationRead);
packageBookingRouter.get("/",                              getPackageBookings);
packageBookingRouter.get("/:bookingId",                    getPackageBookingById);
packageBookingRouter.put("/:bookingId/status",             updatePackageBookingStatus);
packageBookingRouter.delete("/:bookingId",                 deletePackageBooking);

export default packageBookingRouter;
