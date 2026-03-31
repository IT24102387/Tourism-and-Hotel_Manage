import Hotel from "../models/Hotel.js";
import { isItAdmin } from "./userController.js";

// ─── HOTEL CRUD ────────────────────────────────────────────

export async function addHotel(req, res) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Only admins can add hotels" });
    }
    if (req.body.hotelId < 0) {
        return res.status(400).json({ message: "Hotel ID must be greater than 0" });
    }

    if(req.body.contactEmail.length > 0 && !req.body.contactEmail.includes("@")) {
        return res.status(400).json({ message: "Invalid email address" });
    }
  
    if(req.body.contactPhone.length < 0 || req.body.contactPhone.length > 10){
        return res.status(400).json({ message: "Invalid phone number" });
    }
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

    if(req.body.contactEmail.length > 0 && !req.body.contactEmail.includes("@")) {
        return res.status(400).json({ message: "Invalid email address" });
    }
    if(req.body.contactPhone.length < 0 || req.body.contactPhone.length > 10){
        return res.status(400).json({ message: "Invalid phone number" });
    }
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
        await Hotel.deleteOne({ hotelId: req.params.hotelId });
        res.json({ message: "Hotel deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete hotel" });
    }
}
