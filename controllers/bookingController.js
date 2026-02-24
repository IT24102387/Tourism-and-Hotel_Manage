import Booking from "../models/booking.js";
import { isItAdmin } from "./userController.js";

/* ================= CREATE BOOKING ================= */

export function createBooking(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Login first!" });
  }

  const bookingId = "BK-" + Date.now();

  const booking = new Booking({
    bookingId,
    userId: req.user._id,        // ⚠️ see userController fix below
    customerDetails: {
      name: req.user.firstName + " " + req.user.lastName,
      email: req.user.email,
      phone: req.user.phone
    },
    ...req.body,
  });

  booking.save().then(() => {
    res.status(201).json({ message: "Booking created successfully", booking });
  }).catch((error) => {
    res.status(500).json({ message: "Failed to create booking" });
  });
}

/* ================= GET ALL (ADMIN) ================= */

export function getAllBookings(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ message: "You are not authorized" });
  }

  Booking.find().sort({ createdAt: -1 }).then((bookings) => {
    res.json(bookings);
  }).catch((error) => {
    res.status(500).json({ message: "Failed to fetch bookings" });
  });
}

/* ================= GET BY ID ================= */

export function getBookingById(req, res) {
  Booking.findOne({ bookingId: req.params.bookingId }).then((booking) => {
    if (booking == null) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  }).catch((error) => {
    res.status(500).json({ message: "Failed to fetch booking" });
  });
}

/* ================= USER BOOKINGS ================= */

export function getUserBookings(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Login first!" });
  }

  Booking.find({ userId: req.user._id }).sort({ createdAt: -1 }).then((bookings) => {
    res.json(bookings);
  }).catch((error) => {
    res.status(500).json({ message: "Failed to fetch user bookings" });
  });
}

/* ================= CANCEL BOOKING ================= */

export function cancelBooking(req, res) {
  if (req.user == null) {
    return res.status(401).json({ message: "Login first!" });
  }

  Booking.findOne({ bookingId: req.params.bookingId }).then((booking) => {
    if (booking == null) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only the owner or admin can cancel
    const isOwner = String(booking.userId) == String(req.user._id);
    if (!isOwner && !isItAdmin(req)) {
      return res.status(403).json({ message: "You are not authorized to cancel this booking" });
    }

    if (booking.bookingStatus == "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "cancelled";
    return booking.save().then(() => {
      res.json({ message: "Booking cancelled", booking });
    });

  }).catch((error) => {
    res.status(500).json({ message: "Failed to cancel booking" });
  });
}

/* ================= UPDATE PAYMENT ================= */

export function updateBookingPayment(req, res) {
  const { bookingId, paymentStatus, paymentSlip, paymentId } = req.body;

  if (!bookingId || !paymentStatus) {
    return res.status(400).json({ message: "bookingId and paymentStatus are required" });
  }

  Booking.findOne({ bookingId }).then((booking) => {
    if (booking == null) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = paymentStatus;
    if (paymentSlip) booking.paymentSlip = paymentSlip;
    if (paymentId) booking.paymentId = paymentId;

    if (paymentStatus == "paid") {
      booking.bookingStatus = "confirmed";
    }

    return booking.save().then(() => {
      res.json({ message: "Payment updated", booking });
    });

  }).catch((error) => {
    res.status(500).json({ message: "Failed to update payment" });
  });
}

/* ================= ADMIN VERIFY ================= */

export function verifyPayment(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ message: "You are not authorized" });
  }

  Booking.findOne({ bookingId: req.params.bookingId }).then((booking) => {
    if (booking == null) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.paymentStatus = "paid";
    booking.bookingStatus = "confirmed";
    booking.notificationSent = false; // trigger notification system

    return booking.save().then(() => {
      res.json({ message: "Payment verified", booking });
    });

  }).catch((error) => {
    res.status(500).json({ message: "Failed to verify payment" });
  });
}

/* ================= FILTER BY STATUS ================= */

export function getBookingsByStatus(req, res) {
  if (!isItAdmin(req)) {
    return res.status(403).json({ message: "You are not authorized" });
  }

  Booking.find({ paymentStatus: req.params.status }).sort({ createdAt: -1 }).then((bookings) => {
    res.json(bookings);
  }).catch((error) => {
    res.status(500).json({ message: "Failed to fetch bookings by status" });
  });
}