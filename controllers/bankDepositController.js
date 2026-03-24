import BankDeposit from "../models/BankDeposit.js";
import BankDetails from "../models/BankDetails.js";
import { isItAdmin, isItCustomer } from "./userController.js";
import { sendBankDepositConfirmationEmail, sendPaymentApprovalEmail, sendPaymentRejectionEmail } from "../utils/mailer.js";

// Create a bank deposit payment (customer)
export async function createBankDeposit(req, res) {
    if (!isItCustomer(req)) {
        return res.status(403).json({ error: "Only customers can create deposits" });
    }

    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            countryCode,
            paymentAmount,
            depositAmount,
            paymentReason,
            bankName,
            branchName,
            receiptFile,
            receiptFileType,
            cartItems,
            bookingDetails,
            bookingType,
            bookingReferenceId,
        } = req.body;

        if (!paymentAmount || Number(paymentAmount) <= 0) {
            return res.status(400).json({ error: "Total amount must be greater than 0" });
        }

        // Validate deposit amount
        if (depositAmount > paymentAmount) {
            return res.status(400).json({ error: "Deposit amount cannot exceed total amount" });
        }

        if (depositAmount <= 0) {
            return res.status(400).json({ error: "Deposit amount must be greater than 0" });
        }

        // Country code is mandatory and must start with +
        if (!countryCode || !/^\+\d{1,4}$/.test(countryCode)) {
            return res.status(400).json({ error: "Country code is required in +XX format" });
        }
        if (!String(customerEmail || "").includes("@")) {
            return res.status(400).json({ error: "Email must contain @" });
        }

        // Phone validation by country code (basic length ranges)
        const onlyDigitsPhone = String(customerPhone || "").replace(/\D/g, "");
        if (onlyDigitsPhone.length > 10) {
            return res.status(400).json({ error: "Phone number must not exceed 10 digits" });
        }
        const phoneLengthByCode = {
            "+94": [9, 9],
            "+1": [10, 10],
            "+44": [10, 10],
            "+91": [10, 10],
            "+86": [10, 10],
        };
        const [minLen, maxLen] = phoneLengthByCode[countryCode] || [6, 15];
        if (onlyDigitsPhone.length < minLen || onlyDigitsPhone.length > maxLen) {
            return res.status(400).json({
                error: `Phone number length is invalid for ${countryCode}. Expected ${minLen}-${maxLen} digits.`,
            });
        }

        // Validate file type
        const validFileTypes = ["jpg", "jpeg", "pdf"];
        if (!validFileTypes.includes(receiptFileType.toLowerCase())) {
            return res.status(400).json({ error: "Only JPG or PDF files are allowed" });
        }

        const newDeposit = new BankDeposit({
            customerId: req.user ? req.user._id : null,
            customerName,
            customerEmail,
            customerPhone,
            countryCode,
            paymentAmount,
            depositAmount,
            paymentReason,
            bankName,
            branchName,
            receiptFile,
            receiptFileType,
            cartItems,
            bookingDetails,
            bookingType: bookingType || "",
            bookingReferenceId: bookingReferenceId || "",
        });

        await newDeposit.save();

        // Send email to admin
        const bankDetails = await BankDetails.findOne();
        if (bankDetails) {
            await sendBankDepositConfirmationEmail(newDeposit, bankDetails);
        }

        res.json({
            message: "Bank deposit submitted successfully. Admin will review and notify you.",
            deposit: newDeposit,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create bank deposit" });
    }
}

// Get all bank deposits (admin) or own deposits (customer)
export async function getBankDeposits(req, res) {
    try {
        let deposits;

        if (isItAdmin(req)) {
            // Admin sees all deposits
            deposits = await BankDeposit.find().sort({ createdAt: -1 });
        } else if (isItCustomer(req)) {
            // Customer sees only their own deposits
            deposits = await BankDeposit.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ error: "Unauthorized" });
        }

        res.json(deposits);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch bank deposits" });
    }
}

// Get a single bank deposit by ID
export async function getBankDepositById(req, res) {
    try {
        const { id } = req.params;
        const deposit = await BankDeposit.findById(id);

        if (!deposit) {
            return res.status(404).json({ error: "Deposit not found" });
        }

        // Check authorization - customer can only view own, admin can view all
        if (!isItAdmin(req) && deposit.customerEmail !== req.user.email) {
            return res.status(403).json({ error: "Unauthorized to view this deposit" });
        }

        res.json(deposit);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch deposit" });
    }
}

// Approve a bank deposit (admin only)
export async function approveBankDeposit(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can approve deposits" });
    }

    try {
        const { id } = req.params;
        const { adminNotes } = req.body;

        const deposit = await BankDeposit.findByIdAndUpdate(
            id,
            {
                status: "approved",
                adminNotes,
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!deposit) {
            return res.status(404).json({ error: "Deposit not found" });
        }

        // Send approval email to customer
        const bankDetails = await BankDetails.findOne();
        await sendPaymentApprovalEmail(deposit, bankDetails);

        res.json({ message: "Payment approved and customer notified", deposit });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to approve deposit" });
    }
}

// Reject a bank deposit (admin only) - requires reason
export async function rejectBankDeposit(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can reject deposits" });
    }

    try {
        const { id } = req.params;
        const { rejectionReason, adminNotes } = req.body;

        if (!rejectionReason || rejectionReason.trim() === "") {
            return res.status(400).json({ error: "Rejection reason is required" });
        }

        const deposit = await BankDeposit.findByIdAndUpdate(
            id,
            {
                status: "rejected",
                rejectionReason,
                adminNotes,
                updatedAt: Date.now(),
            },
            { new: true }
        );

        if (!deposit) {
            return res.status(404).json({ error: "Deposit not found" });
        }

        // Send rejection email to customer
        const bankDetails = await BankDetails.findOne();
        await sendPaymentRejectionEmail(deposit, bankDetails);

        res.json({ message: "Payment rejected and customer notified", deposit });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to reject deposit" });
    }
}

// Edit a bank deposit (admin only) - can only edit pending deposits
export async function editBankDeposit(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can edit deposits" });
    }

    try {
        const { id } = req.params;
        const updates = req.body;

        const deposit = await BankDeposit.findById(id);
        if (!deposit) {
            return res.status(404).json({ error: "Deposit not found" });
        }

        if (deposit.status !== "pending") {
            return res.status(400).json({ error: "Can only edit pending deposits" });
        }

        if (typeof updates.depositAmount !== "undefined") {
            const depositAmount = Number(updates.depositAmount);
            const paymentAmount = Number(updates.paymentAmount ?? deposit.paymentAmount);
            if (depositAmount <= 0 || depositAmount > paymentAmount) {
                return res.status(400).json({ error: "Deposit amount must be > 0 and <= total amount" });
            }
        }

        // Update fields
        Object.assign(deposit, updates, { updatedAt: Date.now() });
        await deposit.save();

        res.json({ message: "Deposit updated successfully", deposit });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to edit deposit" });
    }
}

// Delete a bank deposit (admin only) - requires reason
export async function deleteBankDeposit(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can delete deposits" });
    }

    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason || reason.trim() === "") {
            return res.status(400).json({ error: "Deletion reason is required" });
        }

        const deposit = await BankDeposit.findByIdAndDelete(id);
        if (!deposit) {
            return res.status(404).json({ error: "Deposit not found" });
        }

        res.json({ message: "Deposit deleted successfully", reason });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete deposit" });
    }
}

// Get payment stats (admin dashboard)
export async function getPaymentStats(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can view stats" });
    }

    try {
        const total = await BankDeposit.countDocuments();
        const approved = await BankDeposit.countDocuments({ status: "approved" });
        const rejected = await BankDeposit.countDocuments({ status: "rejected" });
        const pending = await BankDeposit.countDocuments({ status: "pending" });

        const totalAmount = await BankDeposit.aggregate([
            { $group: { _id: null, total: { $sum: "$depositAmount" } } }
        ]);

        res.json({
            total,
            approved,
            rejected,
            pending,
            totalAmount: totalAmount[0]?.total || 0,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
}
