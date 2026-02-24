import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  bookingType: {
    type: String,
    enum: ['room', 'vehicle', 'camping', 'food', 'package'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  itemDetails: {
    name: String,
    type: String,
    price: Number
  },
  startDate: Date,
  endDate: Date,
  quantity: Number,
  totalAmount: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'bank_deposit'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentSlip: {
    type: String, // URL to uploaded slip
    default: null
  },
  paymentId: {
    type: String, // Online payment transaction ID
    default: null
  },
  customerDetails: {
    name: String,
    email: String,
    phone: String
  },
  adminNotes: String,
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking; 