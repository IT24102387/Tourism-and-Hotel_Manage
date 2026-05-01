import mongoose from "mongoose";

const roomBookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    email: {
        type: String,
        required: true
    },
    roomKey: {
        type: String,
        required: true
    },
    room: {
        key:        { type: String, required: true },
        roomNumber: { type: String, required: true },
        hotelName:  { type: String, required: true },
        roomType:   { type: String, required: true },
        image:      { type: String, required: true },
        price:      { type: Number, required: true }
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    numberOfGuests: {
        type: Number,
        required: true,
        default: 1
    },
    numberOfNights: {
        type: Number,
        required: true
    },
    specialRequests: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ["bank_deposit", "online", "checkout"],
        default: "bank_deposit"
    },
    paymentSlip: {
        type: String,
        default: null
    },
    paymentStatus: {
        type: String,
        required: true,
        default: "pending",
        enum: ["pending", "verified", "rejected"]
    },
    isApproved: {
        type: Boolean,
        required: true,
        default: false
    },
    totalAmount: {
        type: Number,
        required: true
    },
    bookingDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    // Checkout payment specific fields
    checkoutEmailSent: {
        type: Boolean,
        default: false
    },
    checkoutEmailSentAt: {
        type: Date,
        default: null
    },
    // User cancellation notification fields
    cancelledByUser: {
        type: Boolean,
        default: false
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    adminNotified: {
        type: Boolean,
        default: false
    },
    isCancelled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const RoomBooking = mongoose.model("RoomBooking", roomBookingSchema);
export default RoomBooking;