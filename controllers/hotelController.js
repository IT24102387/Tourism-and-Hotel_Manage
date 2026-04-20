import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import RoomBooking from "../models/Roombooking.js";
import { isItAdmin } from "./userController.js";

// ─── VALIDATION HELPERS ────────────────────────────────────────────

function validateEmail(email) {
    // Must contain @ and match basic email pattern
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    // Strip spaces, dashes, parentheses — must be exactly 10 digits
    const digits = phone.replace(/[\s\-()+]/g, "");
    return /^\d{10}$/.test(digits);
}

// ─── HOTEL CRUD ────────────────────────────────────────────

export async function addHotel(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can add hotels" });
    }
    if (req.body.hotelId < 0) {
        return res.status(400).json({ message: "Hotel ID must be greater than 0" });
    }

    const { name, location, description, contactEmail, contactPhone } = req.body;

    if (!name || !name.trim())
        return res.status(400).json({ message: "Hotel name is required" });
    if (!location || !location.trim())
        return res.status(400).json({ message: "Location is required" });
    if (!description || !description.trim())
        return res.status(400).json({ message: "Description is required" });
    if (contactEmail && !validateEmail(contactEmail))
        return res.status(400).json({ message: "Invalid email address. Must include @ and a valid domain (e.g. info@hotel.com)" });
    if (contactPhone && !validatePhone(contactPhone))
        return res.status(400).json({ message: "Phone number must be exactly 10 digits" });

    try {
        const hotel = new Hotel(req.body);
        await hotel.save();
        res.json({ message: "Hotel added successfully", hotel });
    } catch (e) {
        res.status(500).json({ error: "Failed to add hotel", detail: e.message });
    }
}

export async function getHotels(req, res) {
    try {
        let hotels;
        if (isItAdmin(req)) {
            hotels = await Hotel.find().sort({ name: 1 });
        } else {
            hotels = await Hotel.find({ isActive: true }).sort({ name: 1 });
        }
        res.json(hotels);
    } catch (e) {
        res.status(500).json({ message: "Failed to get hotels" });
    }
}

export async function getHotel(req, res) {
    try {
        const hotel = await Hotel.findOne({ hotelId: req.params.hotelId });
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });
        res.json(hotel);
    } catch (e) {
        res.status(500).json({ message: "Failed to get hotel" });
    }
}

export async function updateHotel(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ message: "Only admins can update hotels" });
    }

    const { name, location, description, contactEmail, contactPhone } = req.body;

    if (name !== undefined && !name.trim())
        return res.status(400).json({ message: "Hotel name cannot be empty" });
    if (location !== undefined && !location.trim())
        return res.status(400).json({ message: "Location cannot be empty" });
    if (description !== undefined && !description.trim())
        return res.status(400).json({ message: "Description cannot be empty" });
    if (contactEmail && !validateEmail(contactEmail))
        return res.status(400).json({ message: "Invalid email address. Must include @ and a valid domain (e.g. info@hotel.com)" });
    if (contactPhone && !validatePhone(contactPhone))
        return res.status(400).json({ message: "Phone number must be exactly 10 digits" });

    try {
        await Hotel.updateOne({ hotelId: req.params.hotelId }, req.body);
        res.json({ message: "Hotel updated successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to update hotel" });
    }
}

export async function deleteHotel(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ message: "Only admins can delete hotels" });
    }
    try {
        const hotel = await Hotel.findOne({ hotelId: req.params.hotelId });
        if (!hotel) return res.status(404).json({ message: "Hotel not found" });

        const hotelRooms = await Room.find({ hotelName: hotel.name });
        const roomKeys = hotelRooms.map(r => r.key);

        if (roomKeys.length > 0) {
            const activeBooking = await RoomBooking.findOne({
                roomKey: { $in: roomKeys },
                paymentStatus: { $ne: "rejected" }
            });
            if (activeBooking) {
                return res.status(400).json({
                    message: "Cannot delete this hotel. One or more rooms have active bookings. Please wait until all bookings are completed or cancelled before deleting."
                });
            }
        }

        await Hotel.deleteOne({ hotelId: req.params.hotelId });
        res.json({ message: "Hotel deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete hotel" });
    }
}
