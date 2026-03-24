import mongoose from "mongoose";

const bankDepositSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    },
    customerName: {
        type: String,
        required: true,
    },
    customerEmail: {
        type: String,
        required: true,
    },
    customerPhone: {
        type: String,
        required: true,
    },
    countryCode: {
        type: String,
        required: true,
    },
    paymentAmount: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) {
                return v > 0;
            },
            message: "Payment amount must be greater than 0",
        },
    },
    depositAmount: {
        type: Number,
        required: true,
        min: [0.01, "Deposit amount must be greater than 0"],
    },
    paymentReason: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    branchName: {
        type: String,
        required: true,
    },
    receiptFile: {
        type: String, // URL or file path
        required: true,
    },
    receiptFileType: {
        type: String,
        enum: ["jpg", "jpeg", "pdf"],
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
    },
    rejectionReason: {
        type: String,
        default: null,
    },
    adminNotes: {
        type: String,
        default: null,
    },
    cartItems: {
        type: Array,
        default: [],
    },
    bookingDetails: {
        type: Object,
        default: null,
    },
    bookingType: {
        type: String,
        default: "",
        trim: true,
    },
    bookingReferenceId: {
        type: String,
        default: "",
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const BankDeposit = mongoose.model("BankDeposit", bankDepositSchema);

export default BankDeposit;
