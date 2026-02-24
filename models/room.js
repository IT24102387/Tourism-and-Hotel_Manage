import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  key: {
    type: String,
    required: [true, 'Room key is required'],
    unique: true,
    trim: true
  },
  hotelName: {
    type: String,
    required: [true, 'Hotel/Guest House name is required'],
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Triple', 'Quad', 'Suite', 'Deluxe']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  availability: {
    type: Boolean,
    default: true
  },
  availabilitySchedule: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  }],
  facilities: {
    ac: {
      type: Boolean,
      default: false
    },
    wifi: {
      type: Boolean,
      default: false
    },
    parking: {
      type: Boolean,
      default: false
    },
    tv: {
      type: Boolean,
      default: false
    },
    hotWater: {
      type: Boolean,
      default: false
    },
    miniBar: {
      type: Boolean,
      default: false
    }
  },
  // Additional fields for better management
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  bookedDates: [{
    startDate: Date,
    endDate: Date,
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment'
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['Available', 'Booked', 'Maintenance', 'Unavailable'],
    default: 'Available'
  }
}, {
  timestamps: true
});

// Method to check if room is available for specific dates
roomSchema.methods.isAvailableForDates = function(startDate, endDate) {
  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);
  
  // Check against booked dates
  const isBooked = this.bookedDates.some(booking => {
    if (booking.status === 'cancelled') return false;
    
    const existingStart = new Date(booking.startDate);
    const existingEnd = new Date(booking.endDate);
    
    return (newStart < existingEnd && newEnd > existingStart);
  });
  
  return !isBooked;
};

const Room = mongoose.model("Room", roomSchema);

export default Room;