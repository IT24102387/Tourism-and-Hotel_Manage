import PackageBooking from "../models/PackageBooking.js";

import nodemailer from "nodemailer";

function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
}

async function sendAdminCancellationEmail(booking) {
    const transporter = createTransporter();
    const bookedOn = new Date(booking.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
    const tourDate = new Date(booking.tourDate).toLocaleDateString("en-US", { dateStyle: "long" });
    await transporter.sendMail({
        from: `"Kadiraa Resort" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `⚠️ Package Booking Cancelled — ${booking.bookingId}`,
        html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
          <div style="background:linear-gradient(135deg,#1a0a00,#3d1a00);padding:32px 36px;text-align:center;">
            <h1 style="margin:0;color:#F5A623;font-size:24px;">Kadiraa Resort</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Admin Notification</p>
          </div>
          <div style="padding:32px 36px;">
            <h2 style="color:#c0392b;margin:0 0 18px;">🚫 Booking Cancellation Request</h2>
            <p style="color:#555;font-size:14px;margin:0 0 20px;">A customer has cancelled their safari package booking during the pending period.</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;color:#333;">
              <tr style="background:#fdf6ec;">
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Booking ID</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${booking.bookingId}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Customer</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${booking.userName}</td>
              </tr>
              <tr style="background:#fdf6ec;">
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Email</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${booking.userEmail}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Package</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${booking.packageName}</td>
              </tr>
              <tr style="background:#fdf6ec;">
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Tour Date</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${tourDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Guests</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">${booking.guests}</td>
              </tr>
              <tr style="background:#fdf6ec;">
                <td style="padding:10px 14px;font-weight:600;border-bottom:1px solid #f0e6d0;">Total Price</td>
                <td style="padding:10px 14px;border-bottom:1px solid #f0e6d0;">LKR ${booking.totalPrice?.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding:10px 14px;font-weight:600;">Booked On</td>
                <td style="padding:10px 14px;">${bookedOn}</td>
              </tr>
            </table>
            <p style="color:#888;font-size:12px;margin-top:24px;">This cancellation was submitted within 24 hours of booking creation.</p>
          </div>
        </div>`,
    });
}

const isAdmin   = (req) => req.user?.role === "admin";
const isLoggedIn = (req) => req.user != null;

// CREATE — user submits a booking
export async function createPackageBooking(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login to book a package" });
    try {
        const bookingId = `PB-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
        const booking = new PackageBooking({
            ...req.body,
            bookingId,
            userId:    req.user.userId,
            userEmail: req.user.email,
            userName:  `${req.user.firstName} ${req.user.lastName}`,
        });
        await booking.save();
        res.json({ message: "Booking created successfully", booking });
    } catch (e) {
        res.status(500).json({ message: "Failed to create booking", error: e.message });
    }
}

// GET ALL — admin sees all, user sees own
export async function getPackageBookings(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const filter = isAdmin(req) ? {} : { userId: req.user.userId };
        const bookings = await PackageBooking.find(filter).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

// GET MY BOOKINGS — always returns only the logged-in user's bookings
export async function getMyBookings(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const bookings = await PackageBooking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

// GET ONE
export async function getPackageBookingById(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const booking = await PackageBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (!isAdmin(req) && booking.userEmail !== req.user.email) return res.status(403).json({ message: "Access denied" });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch booking" });
    }
}

// UPDATE STATUS — admin only
export async function updatePackageBookingStatus(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const booking = await PackageBooking.findOneAndUpdate(
            { bookingId: req.params.bookingId },
            { status: req.body.status },
            { new: true }
        );
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        res.json({ message: "Status updated", booking });
    } catch (e) {
        res.status(500).json({ message: "Failed to update" });
    }
}

// DELETE / CANCEL — owner or admin (soft-cancel: sets status to Cancelled)
export async function deletePackageBooking(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const booking = await PackageBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (!isAdmin(req) && booking.userEmail !== req.user.email) return res.status(403).json({ message: "Access denied" });

        if (!isAdmin(req)) {
            // Confirmed bookings cannot be cancelled by the user
            if (booking.status === "Confirmed") {
                return res.status(400).json({ message: "This booking has been confirmed and cannot be cancelled. Please contact us for assistance." });
            }
            if (booking.status === "Cancelled") {
                return res.status(400).json({ message: "This booking is already cancelled." });
            }
            // Only allow cancellation within 24 hours of booking creation
            const hoursSinceBooking = (Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60);
            if (hoursSinceBooking > 24) {
                return res.status(400).json({ message: "The cancellation window has expired. Bookings can only be cancelled within 24 hours of placing them." });
            }

            // Soft-cancel: mark as Cancelled and flag for admin notification
            await PackageBooking.findOneAndUpdate(
                { bookingId: req.params.bookingId },
                {
                    status: "Cancelled",
                    cancelledByUser: true,
                    cancelledAt: new Date(),
                    adminNotified: false,
                }
            );

            // Also send admin email
            sendAdminCancellationEmail(booking).catch((err) =>
                console.error("Admin cancellation email failed:", err.message)
            );

            return res.json({ message: "Booking cancelled successfully" });
        }

        // Admin hard-delete
        await PackageBooking.deleteOne({ bookingId: req.params.bookingId });
        res.json({ message: "Booking deleted" });
    } catch (e) {
        res.status(500).json({ message: "Failed to cancel booking" });
    }
}

// GET CANCELLED NOTIFICATIONS — admin only, returns user-cancelled bookings not yet acknowledged
export async function getCancelledNotifications(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const notifications = await PackageBooking.find({
            cancelledByUser: true,
            adminNotified: false,
        }).sort({ cancelledAt: -1 });
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
}

// MARK NOTIFICATION AS READ — admin only
export async function markNotificationRead(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        await PackageBooking.findOneAndUpdate(
            { bookingId: req.params.bookingId },
            { adminNotified: true }
        );
        res.json({ message: "Notification marked as read" });
    } catch (e) {
        res.status(500).json({ message: "Failed to mark notification" });
    }
}
