import mongoose from "mongoose";

const bankDetailsSchema = new mongoose.Schema({
    accountNumber: {
        type: String,
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    branch: {
        type: String,
        required: true,
    },
    accountHolderName: {
        type: String,
        required: true,
    },
    adminPhone: {
        type: String,
        required: true,
    },
    adminEmail: {
        type: String,
        required: true,
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

const BankDetails = mongoose.model("BankDetails", bankDetailsSchema);

export default BankDetails;
