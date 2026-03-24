import CustomPackageBooking from "../models/CustomPackageBooking.js";

const isAdmin   = (req) => req.user?.role === "admin";
const isLoggedIn = (req) => req.user != null;

// CREATE — user submits a customised booking
export async function createCustomBooking(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login to book a package" });
    try {
        const bookingId = `CPB-${Date.now().toString().slice(-6)}${Math.random().toString(36).slice(2,5).toUpperCase()}`;
        const booking = new CustomPackageBooking({
            ...req.body,
            bookingId,
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
export async function getCustomBookings(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const filter = isAdmin(req) ? {} : { userEmail: req.user.email };
        const bookings = await CustomPackageBooking.find(filter).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch bookings" });
    }
}

// GET ONE
export async function getCustomBookingById(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const booking = await CustomPackageBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (!isAdmin(req) && booking.userEmail !== req.user.email) return res.status(403).json({ message: "Access denied" });
        res.json(booking);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch booking" });
    }
}

// UPDATE STATUS — admin only
export async function updateBookingStatus(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const booking = await CustomPackageBooking.findOneAndUpdate(
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

// DELETE — owner or admin
export async function deleteCustomBooking(req, res) {
    if (!isLoggedIn(req)) return res.status(401).json({ message: "Please login" });
    try {
        const booking = await CustomPackageBooking.findOne({ bookingId: req.params.bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (!isAdmin(req) && booking.userEmail !== req.user.email) return res.status(403).json({ message: "Access denied" });
        await CustomPackageBooking.deleteOne({ bookingId: req.params.bookingId });
        res.json({ message: "Booking cancelled" });
    } catch (e) {
        res.status(500).json({ message: "Failed to cancel booking" });
    }
}
