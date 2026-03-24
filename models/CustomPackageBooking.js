import mongoose from "mongoose";

const customPackageBookingSchema = new mongoose.Schema({
    bookingId:   { type: String, required: true, unique: true },
    packageId:   { type: String, required: true },
    packageName: { type: String, required: true },
    userEmail:   { type: String, required: true },
    userName:    { type: String, required: true },
    userPhone:   { type: String, default: "" },
    tourDate:    { type: Date, required: true },
    guests:      { type: Number, required: true, min: 1 },
    selectedActivities: { type: [String], default: [] },

    // Vehicle selected by user
    selectedVehicle: {
        vehicleId:          { type: String, default: null },
        vehicleName:        { type: String, default: null },
        vehicleType:        { type: String, default: null },
        vehiclePricePerDay: { type: Number, default: 0 },
    },

    addOns: {
        meals:        { type: Boolean, default: false },
        privateGuide: { type: Boolean, default: false },
        photography:  { type: Boolean, default: false },
        hotelPickup:  { type: Boolean, default: false },
    },
    specialRequests:    { type: String, default: "" },
    basePricePerPerson: { type: Number, required: true },
    vehicleTotal:       { type: Number, default: 0 },
    addOnTotal:         { type: Number, default: 0 },
    totalPrice:         { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
        default: "Pending",
    },
}, { timestamps: true });

const CustomPackageBooking = mongoose.model("CustomPackageBooking", customPackageBookingSchema);
export default CustomPackageBooking;
