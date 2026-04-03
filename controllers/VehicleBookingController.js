import VehicleBooking from "../models/VehicleBooking.js";
import Vehicle from "../models/Vehicle.js";

// Create a new booking
export async function createBooking(req, res) {
    try {
        const bookingData = req.body;
        
        console.log("Received booking data:", bookingData);

        // Validate required fields
        const requiredFields = [
            'vehicleId', 'vehicleName', 'regNo', 'vehicleType',
            'capacity', 'pricePerDay', 'startDate', 'endDate',
            'totalDays', 'totalPrice', 'passengers',
            'customerName', 'customerEmail', 'customerPhone'
        ];

        const missingFields = [];
        for (const field of requiredFields) {
            if (!bookingData[field] && bookingData[field] !== 0) {
                missingFields.push(field);
            }
        }

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(", ")}`
            });
        }

        // Validate numbers
        if (isNaN(bookingData.totalDays) || bookingData.totalDays <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid number of days. Must be a positive number."
            });
        }

        if (isNaN(bookingData.totalPrice) || bookingData.totalPrice < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid total price."
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(bookingData.customerEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format."
            });
        }

        // Validate dates
        const startDate = new Date(bookingData.startDate);
        const endDate = new Date(bookingData.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please use YYYY-MM-DD."
            });
        }
        
        if (endDate <= startDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after start date."
            });
        }

        // Check if vehicle exists and is available
        const vehicle = await Vehicle.findById(bookingData.vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found."
            });
        }

        if (!vehicle.availability) {
            return res.status(400).json({
                success: false,
                message: "Vehicle is currently not available for booking."
            });
        }

        // Check for overlapping bookings
        const overlappingBooking = await VehicleBooking.findOne({
            vehicleId: bookingData.vehicleId,
            status: { $in: ["Pending", "Confirmed"] },
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        });

        if (overlappingBooking) {
            return res.status(400).json({
                success: false,
                message: `Vehicle is already booked for the selected dates.`
            });
        }

        // Create the booking
        const newBooking = new VehicleBooking({
            ...bookingData,
            startDate,
            endDate,
            bookingDate: new Date(),
            status: "Pending"
        });

        const savedBooking = await newBooking.save();

        res.status(201).json({
            success: true,
            message: "Booking created successfully!",
            booking: savedBooking
        });

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create booking."
        });
    }
}

// Get all bookings (admin only)
export async function getAllBookings(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view all bookings."
            });
        }

        const bookings = await VehicleBooking.find()
            .sort({ createdAt: -1 })
            .populate('vehicleId', 'name registrationNumber');

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings."
        });
    }
}

// Get bookings for a specific user by email
export async function getUserBookings(req, res) {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const bookings = await VehicleBooking.find({ 
            customerEmail: email.toLowerCase() 
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings."
        });
    }
}

// Get a single booking by ID
export async function getBookingById(req, res) {
    try {
        const { id } = req.params;
        
        if (!id || id === "undefined") {
            return res.status(400).json({
                success: false,
                message: "Invalid booking ID."
            });
        }

        const booking = await VehicleBooking.findById(id).populate('vehicleId', 'name registrationNumber image');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        res.json({
            success: true,
            booking
        });
    } catch (error) {
        console.error("Error fetching booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking."
        });
    }
}

// Update booking status (admin only)
export async function updateBookingStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update booking status."
            });
        }

        const validStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const booking = await VehicleBooking.findByIdAndUpdate(
            id,
            { 
                status,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        res.json({
            success: true,
            message: "Booking status updated successfully.",
            booking
        });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update booking status."
        });
    }
}

// HARD DELETE - Permanently remove booking from database
export async function hardDeleteBooking(req, res) {
    try {
        const { id } = req.params;
        
        console.log(`Attempting to hard delete booking: ${id}`);
        
        // Find the booking first
        const booking = await VehicleBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Optional: Add authorization check (only admin or the customer who made the booking)
        // For public access, we'll allow deletion without authentication
        // If you want to restrict to admins only, uncomment the code below:
        /*
        if (!req.user || (req.user.role !== "admin" && booking.customerEmail !== req.user.email)) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this booking."
            });
        }
        */

        // Permanently delete the booking
        await VehicleBooking.findByIdAndDelete(id);
        
        console.log(`Booking ${id} permanently deleted from database`);

        res.json({
            success: true,
            message: "Booking has been permanently deleted from the database.",
            deletedBookingId: id
        });
    } catch (error) {
        console.error("Error hard deleting booking:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete booking."
        });
    }
}

// Cancel booking (soft delete - just update status)
export async function cancelBooking(req, res) {
    try {
        const { id } = req.params;
        
        const booking = await VehicleBooking.findById(id);
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        if (booking.status === "Cancelled") {
            return res.status(400).json({
                success: false,
                message: "Booking is already cancelled."
            });
        }

        if (booking.status === "Completed") {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel a completed booking."
            });
        }

        booking.status = "Cancelled";
        booking.updatedAt = Date.now();
        await booking.save();

        res.json({
            success: true,
            message: "Booking cancelled successfully.",
            booking
        });
    } catch (error) {
        console.error("Error cancelling booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel booking."
        });
    }
}

// Get booking statistics (admin only)
export async function getBookingStats(req, res) {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to view statistics."
            });
        }

        const totalBookings = await VehicleBooking.countDocuments();
        const pendingBookings = await VehicleBooking.countDocuments({ status: "Pending" });
        const confirmedBookings = await VehicleBooking.countDocuments({ status: "Confirmed" });
        const cancelledBookings = await VehicleBooking.countDocuments({ status: "Cancelled" });
        const completedBookings = await VehicleBooking.countDocuments({ status: "Completed" });

        const totalRevenue = await VehicleBooking.aggregate([
            { $match: { status: { $in: ["Confirmed", "Completed"] } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        res.json({
            success: true,
            stats: {
                total: totalBookings,
                pending: pendingBookings,
                confirmed: confirmedBookings,
                cancelled: cancelledBookings,
                completed: completedBookings,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error("Error fetching booking stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch booking statistics."
        });
    }
}