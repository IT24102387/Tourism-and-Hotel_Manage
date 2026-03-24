import express from "express";
import {
    getBankDetails,
    createBankDetails,
    updateBankDetails,
    deleteBankDetails,
} from "../controllers/bankAccountController.js";

const bankAccountRouter = express.Router();

// Get bank details (public - customers need to see)
bankAccountRouter.get("/", getBankDetails);

// Create bank details (admin only)
bankAccountRouter.post("/", createBankDetails);

// Update bank details (admin only)
bankAccountRouter.put("/", updateBankDetails);

// Delete bank details (admin only)
bankAccountRouter.delete("/", deleteBankDetails);

export default bankAccountRouter;
