import PayHerePayment from "../models/PayHerePayment.js";
import BankDetails from "../models/BankDetails.js";
import { isItAdmin, isItCustomer } from "./userController.js";
import { sendPayHerePaymentCustomerEmail, sendPayHerePaymentAdminEmail } from "../utils/mailer.js";

const phoneLengthByCode = {
    "+94": [9, 9],
    "+1": [10, 10],
    "+44": [10, 10],
    "+91": [10, 10],
    "+86": [10, 10],
};

function validatePhone(countryCode, customerPhone) {
    const digits = String(customerPhone || "").replace(/\D/g, "");
    if (digits.length > 10) return false;
    const [minLen, maxLen] = phoneLengthByCode[countryCode] || [6, 15];
    return digits.length >= minLen && digits.length <= maxLen;
}

export async function createPayHerePayment(req, res) {
    if (!isItCustomer(req)) {
        return res.status(403).json({ error: "Only customers can create PayHere payments" });
    }

    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            countryCode,
            paymentAmount,
            paymentReason,
            transactionId,
            cartItems,
            bookingDetails,
            bookingType,
            bookingReferenceId,
        } = req.body;

        if (!paymentAmount || Number(paymentAmount) <= 0) {
            return res.status(400).json({ error: "Payment amount must be greater than 0" });
        }
        if (!paymentReason || !paymentReason.trim()) {
            return res.status(400).json({ error: "Payment reason is required" });
        }
        if (!transactionId || !transactionId.trim()) {
            return res.status(400).json({ error: "Transaction ID is required" });
        }
        if (!countryCode || !/^\+\d{1,4}$/.test(countryCode)) {
            return res.status(400).json({ error: "Country code is required in +XX format" });
        }
        if (!String(customerEmail || "").includes("@")) {
            return res.status(400).json({ error: "Email must contain @" });
        }
        if (!validatePhone(countryCode, customerPhone)) {
            return res.status(400).json({ error: "Phone number is invalid (max 10 digits)" });
        }

        const payment = new PayHerePayment({
            customerId: req.user?._id || null,
            customerName,
            customerEmail,
            customerPhone,
            countryCode,
            paymentAmount,
            paymentReason,
            transactionId,
            cartItems: cartItems || [],
            bookingDetails: bookingDetails || null,
            bookingType: bookingType || "",
            bookingReferenceId: bookingReferenceId || "",
        });

        await payment.save();

        const bankDetails = await BankDetails.findOne();
        await sendPayHerePaymentCustomerEmail(payment, bankDetails);
        if (bankDetails?.adminEmail) {
            await sendPayHerePaymentAdminEmail(payment, bankDetails);
        }

        res.json({ message: "PayHere payment completed successfully", payment });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to create PayHere payment" });
    }
}

export async function getPayHerePayments(req, res) {
    try {
        if (isItAdmin(req)) {
            const payments = await PayHerePayment.find().sort({ createdAt: -1 });
            return res.json(payments);
        }
        if (isItCustomer(req)) {
            const payments = await PayHerePayment.find({ customerEmail: req.user.email }).sort({ createdAt: -1 });
            return res.json(payments);
        }
        return res.status(403).json({ error: "Unauthorized" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch PayHere payments" });
    }
}

export async function updatePayHereReason(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can edit PayHere payments" });
    }

    try {
        const { id } = req.params;
        const { paymentReason, adminNotes } = req.body;

        if (!paymentReason || !paymentReason.trim()) {
            return res.status(400).json({ error: "Payment reason is required" });
        }

        const payment = await PayHerePayment.findByIdAndUpdate(
            id,
            { paymentReason, adminNotes: adminNotes || null, updatedAt: Date.now() },
            { new: true }
        );

        if (!payment) {
            return res.status(404).json({ error: "PayHere payment not found" });
        }

        res.json({ message: "PayHere payment updated successfully", payment });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to update payment" });
    }
}

export async function deletePayHerePayment(req, res) {
    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Only admin can delete PayHere payments" });
    }

    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({ error: "Deletion reason is required" });
        }

        const payment = await PayHerePayment.findByIdAndDelete(id);
        if (!payment) {
            return res.status(404).json({ error: "PayHere payment not found" });
        }

        res.json({ message: "PayHere payment deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to delete payment" });
    }
}
