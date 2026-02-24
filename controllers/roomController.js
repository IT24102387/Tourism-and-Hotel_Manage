import Room from "../models/room.js";
import { isItAdmin } from "./userController.js";

// Add new room (Admin only)
export function addRoom(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Please login and try again" });
        return;
    }
    if (!isItAdmin(req)) {
        res.status(403).json({ message: "You are not authorized to perform this action" });
        return;
    }

    const data = req.body;
    const newRoom = new Room(data);

    newRoom.save().then(() => {
        res.json({ message: "Room added successfully" });
    }).catch((error) => {
        res.status(500).json({ error: "Room addition failed" });
    });
}

// Get all rooms (Admin sees all, users see only available)
export function getRooms(req, res) {
    const query = isItAdmin(req) ? {} : { availability: true };

    Room.find(query).then((rooms) => {
        res.json(rooms);
    }).catch((error) => {
        res.status(500).json({ message: "Failed to get rooms" });
    });
}

// Get room by key
export function getRoomById(req, res) {
    const key = req.params.key;

    Room.findOne({ key: key }).then((room) => {
        if (room == null) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    }).catch((error) => {
        res.status(500).json({ message: "Failed to get room details" });
    });
}

// Get rooms by hotel name
export function getRoomsByHotel(req, res) {
    const hotelName = req.params.hotelName;

    Room.find({
        hotelName: { $regex: hotelName, $options: 'i' },
        availability: true
    }).then((rooms) => {
        res.json(rooms);
    }).catch((error) => {
        res.status(500).json({ message: "Failed to get hotel rooms" });
    });
}

// Search rooms by date range + filters (PDF Requirement: Date-based searching)
export function searchRoomsByDate(req, res) {
    const { checkIn, checkOut, hotelName, roomType, facilities } = req.query;

    if (!checkIn || !checkOut) {
        return res.status(400).json({ message: "Check-in and check-out dates are required" });
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
        return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    // Find rooms with NO conflicting bookings for requested dates
    const query = {
        availability: true,
        bookedDates: {
            $not: {
                $elemMatch: {
                    status: { $in: ["pending", "confirmed"] },
                    startDate: { $lt: new Date(checkOut) },
                    endDate: { $gt: new Date(checkIn) }
                }
            }
        }
    };

    if (hotelName) query.hotelName = { $regex: hotelName, $options: 'i' };
    if (roomType) query.roomType = roomType;
    if (facilities) {
        facilities.split(',').forEach((f) => {
            query[`facilities.${f.trim()}`] = true;
        });
    }

    Room.find(query).then((rooms) => {
        res.json(rooms);
    }).catch((error) => {
        res.status(500).json({ message: "Failed to search rooms" });
    });
}

// Update room (Admin only)
export function updateRoom(req, res) {
    if (!isItAdmin(req)) {
        res.status(403).json({ message: "You are not authorized to perform this action" });
        return;
    }

    const key = req.params.key;
    const data = req.body;

    Room.updateOne({ key: key }, { $set: data }).then((result) => {
        if (result.matchedCount == 0) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json({ message: "Room updated successfully" });
    }).catch((error) => {
        res.status(500).json({ message: "Failed to update room" });
    });
}

// Update room availability/status (Admin only)
export function updateAvailability(req, res) {
    if (!isItAdmin(req)) {
        res.status(403).json({ message: "You are not authorized to perform this action" });
        return;
    }

    const key = req.params.key;
    const { availability, status } = req.body;

    // Only set fields that are actually provided
    const updateData = {};
    if (availability !== undefined) updateData.availability = availability;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length == 0) {
        return res.status(400).json({ message: "No fields provided to update" });
    }

    Room.updateOne({ key: key }, { $set: updateData }).then((result) => {
        if (result.matchedCount == 0) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json({ message: "Room availability updated successfully" });
    }).catch((error) => {
        res.status(500).json({ message: "Failed to update room availability" });
    });
}

// Delete room (Admin only)
export function deleteRoom(req, res) {
    if (!isItAdmin(req)) {
        res.status(403).json({ message: "You are not authorized to perform this action" });
        return;
    }

    const key = req.params.key;

    Room.deleteOne({ key: key }).then((result) => {
        if (result.deletedCount == 0) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json({ message: "Room deleted successfully" });
    }).catch((error) => {
        res.status(500).json({ message: "Failed to delete room" });
    });
}

// Book room - returns details for payment system (PDF Requirement: Payment Integration)
export function bookRoom(req, res) {
    if (req.user == null) {
        res.status(401).json({ message: "Please login and try again" });
        return;
    }

    const { key } = req.params;
    const { checkInDate, checkOutDate, numberOfGuests } = req.body;

    if (!checkInDate || !checkOutDate || !numberOfGuests) {
        return res.status(400).json({
            message: "Check-in date, check-out date, and number of guests are required"
        });
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
        return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    Room.findOne({ key: key }).then((room) => {
        if (room == null) {
            return res.status(404).json({ message: "Room not found" });
        }

        if (!room.availability) {
            return res.status(400).json({ message: "Room is not available" });
        }

        if (!room.isAvailableForDates(checkInDate, checkOutDate)) {
            return res.status(400).json({ message: "Room is not available for selected dates" });
        }

        if (numberOfGuests > room.capacity) {
            return res.status(400).json({
                message: `Room capacity exceeded. Maximum ${room.capacity} guests allowed`
            });
        }

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const numberOfNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const totalAmount = room.price * numberOfNights;

        // Add a pending booked date entry so other users can't double-book
        room.bookedDates.push({
            startDate: checkIn,
            endDate: checkOut,
            status: "pending"
        });

        return room.save().then(() => {
            res.json({
                message: "Room selected. Proceed to payment.",
                bookingDetails: {
                    roomKey: room.key,
                    hotelName: room.hotelName,
                    roomType: room.roomType,
                    roomNumber: room.roomNumber,
                    checkInDate,
                    checkOutDate,
                    numberOfNights,
                    numberOfGuests,
                    pricePerNight: room.price,
                    totalAmount,
                    facilities: room.facilities,
                    customerDetails: {
                        userId: req.user._id,
                        name: req.user.firstName + " " + req.user.lastName,
                        email: req.user.email,
                        phone: req.user.phone
                    }
                }
            });
        });

    }).catch((error) => {
        res.status(500).json({ message: "Failed to process room booking" });
    });
}

// Called by Payment Controller after payment confirmed - locks the booking
export function confirmRoomBooking(req, res) {
    const { roomKey, checkInDate, checkOutDate, bookingId, paymentId } = req.body;

    Room.findOne({ key: roomKey }).then((room) => {
        if (room == null) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find the pending entry and confirm it
        const entry = room.bookedDates.find((b) => {
            return (
                b.status == "pending" &&
                new Date(b.startDate).toDateString() == new Date(checkInDate).toDateString() &&
                new Date(b.endDate).toDateString() == new Date(checkOutDate).toDateString()
            );
        });

        if (entry == null) {
            return res.status(404).json({ message: "Pending booking not found" });
        }

        entry.status = "confirmed";
        entry.bookingId = bookingId || null;
        entry.paymentId = paymentId || null;

        // Update overall room status
        room.status = "Booked";
        room.availability = false;

        return room.save().then(() => {
            res.json({ message: "Room booking confirmed successfully" });
        });

    }).catch((error) => {
        res.status(500).json({ message: "Failed to confirm room booking" });
    });
}

// Called by Payment Controller if payment cancelled/rejected
export function cancelRoomBooking(req, res) {
    const { roomKey, checkInDate, checkOutDate } = req.body;

    Room.findOne({ key: roomKey }).then((room) => {
        if (room == null) {
            return res.status(404).json({ message: "Room not found" });
        }

        // Find and cancel the pending entry
        const entry = room.bookedDates.find((b) => {
            return (
                b.status == "pending" &&
                new Date(b.startDate).toDateString() == new Date(checkInDate).toDateString() &&
                new Date(b.endDate).toDateString() == new Date(checkOutDate).toDateString()
            );
        });

        if (entry == null) {
            return res.status(404).json({ message: "Pending booking not found" });
        }

        entry.status = "cancelled";

        // Restore availability
        room.status = "Available";
        room.availability = true;

        return room.save().then(() => {
            res.json({ message: "Room booking cancelled, room is available again" });
        });

    }).catch((error) => {
        res.status(500).json({ message: "Failed to cancel room booking" });
    });
}