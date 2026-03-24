import BankDetails from "../models/BankDetails.js";
import { isItAdmin } from "./userController.js";

function validateAdminContact(data) {
    const adminPhoneDigits = String(data.adminPhone || "").replace(/\D/g, "");
    if (!adminPhoneDigits || adminPhoneDigits.length > 10) {
        return "Admin phone number must be 10 digits or less";
    }
    if (!String(data.adminEmail || "").includes("@")) {
        return "Admin email must contain @";
    }
    return null;
}

// Get all bank details
export async function getBankDetails(req, res) {
    try {
        const bankDetails = await BankDetails.findOne();
        if (!bankDetails) {
            return res.status(404).json({ error: "No bank details configured" });
        }
        res.json(bankDetails);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch bank details" });
    }
}

// Create bank details (admin only)
export async function createBankDetails(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can create bank details" });
    }

    try {
        const data = req.body;
        const validationError = validateAdminContact(data);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        
        // Check if details already exist
        const existingDetails = await BankDetails.findOne();
        if (existingDetails) {
            return res.status(400).json({ error: "Bank details already exist. Use update endpoint instead." });
        }

        const newBankDetails = new BankDetails(data);
        await newBankDetails.save();
        res.json({ message: "Bank details created successfully", bankDetails: newBankDetails });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create bank details" });
    }
}

// Update bank details (admin only)
export async function updateBankDetails(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can update bank details" });
    }

    try {
        const data = req.body;
        const validationError = validateAdminContact(data);
        if (validationError) {
            return res.status(400).json({ error: validationError });
        }
        data.updatedAt = Date.now();

        const bankDetails = await BankDetails.findOneAndUpdate(
            {},
            data,
            { new: true }
        );

        if (!bankDetails) {
            return res.status(404).json({ error: "Bank details not found" });
        }

        res.json({ message: "Bank details updated successfully", bankDetails });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update bank details" });
    }
}

// Delete bank details (admin only)
export async function deleteBankDetails(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can delete bank details" });
    }

    try {
        const result = await BankDetails.deleteOne({});
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Bank details not found" });
        }
        res.json({ message: "Bank details deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete bank details" });
    }
}
