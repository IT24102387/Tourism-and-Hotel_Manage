import Room from "../models/Room.js";
import RoomBooking from "../models/Roombooking.js";
import nodemailer from "nodemailer";

import { isItAdmin } from "./userController.js";

// ─── EMAIL TRANSPORTER ────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// ─── CHECKOUT BILL EMAIL ──────────────────────────────────
function buildCheckoutEmailHTML(booking) {
    const checkIn  = new Date(booking.checkInDate).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    const checkOut = new Date(booking.checkOutDate).toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });
    const today    = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
    const roomPrice   = booking.room.price;
    const nights      = booking.numberOfNights;
    const roomTotal   = roomPrice * nights;
    const taxRate     = 0.15;
    const taxAmount   = Math.round(roomTotal * taxRate);
    const grandTotal  = roomTotal + taxAmount;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Checkout Bill - ${booking.bookingId}</title>
</head>
<body style="margin:0;padding:0;background:#f4f1eb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<div style="max-width:620px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.12);">

  <!-- HEADER -->
  <div style="background:linear-gradient(135deg,#1a0a00 0%,#3d1a00 100%);padding:36px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.4);border-radius:50%;width:60px;height:60px;line-height:60px;font-size:26px;margin-bottom:16px;">🏨</div>
    <h1 style="margin:0;color:#F5A623;font-size:28px;font-weight:700;letter-spacing:1px;">Kadiraa Resort</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Tourism &amp; Hotel</p>
    <div style="margin:20px auto 0;width:60px;height:2px;background:linear-gradient(90deg,transparent,#F5A623,transparent);"></div>
    <p style="margin:16px 0 0;color:rgba(255,255,255,0.85);font-size:15px;">Checkout Bill &amp; Payment Notice</p>
  </div>

  <!-- GREETING -->
  <div style="padding:32px 40px 0;border-bottom:1px solid #f0ebe0;">
    <p style="margin:0 0 12px;color:#5a4a3a;font-size:15px;">Dear Guest,</p>
    <p style="margin:0 0 20px;color:#5a4a3a;font-size:14px;line-height:1.7;">
      Thank you for staying with us at <strong style="color:#d97706;">Kadiraa Resort</strong>.
      Your checkout date is approaching and we've prepared your detailed bill below.
      Please review and complete the payment at the front desk or via our online portal.
    </p>
    <p style="margin:0 0 24px;color:#5a4a3a;font-size:13px;">Bill generated: <strong>${today}</strong></p>
  </div>

  <!-- BOOKING INFO -->
  <div style="padding:28px 40px;background:#fdfaf5;border-bottom:1px solid #f0ebe0;">
    <h2 style="margin:0 0 20px;color:#1a0a00;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Booking Details</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:8px 0;color:#8a7a6a;font-size:13px;width:45%;">Booking ID</td>
        <td style="padding:8px 0;color:#1a0a00;font-size:13px;font-weight:600;font-family:monospace;">${booking.bookingId}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8a7a6a;font-size:13px;">Hotel</td>
        <td style="padding:8px 0;color:#1a0a00;font-size:13px;font-weight:600;">${booking.room.hotelName}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8a7a6a;font-size:13px;">Room Number</td>
        <td style="padding:8px 0;color:#1a0a00;font-size:13px;font-weight:600;">${booking.room.roomNumber}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8a7a6a;font-size:13px;">Room Type</td>
        <td style="padding:8px 0;color:#1a0a00;font-size:13px;font-weight:600;">${booking.room.roomType}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#8a7a6a;font-size:13px;">Guests</td>
        <td style="padding:8px 0;color:#1a0a00;font-size:13px;font-weight:600;">${booking.numberOfGuests} person(s)</td>
      </tr>
    </table>
  </div>

  <!-- STAY PERIOD -->
  <div style="padding:24px 40px;border-bottom:1px solid #f0ebe0;">
    <div style="display:flex;gap:16px;">
      <div style="flex:1;background:#f8f4ee;border-radius:12px;padding:16px;border-left:3px solid #22c55e;">
        <p style="margin:0 0 4px;color:#8a7a6a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Check-In</p>
        <p style="margin:0;color:#1a0a00;font-size:13px;font-weight:600;">${checkIn}</p>
      </div>
      <div style="flex:1;background:#f8f4ee;border-radius:12px;padding:16px;border-left:3px solid #ef4444;">
        <p style="margin:0 0 4px;color:#8a7a6a;font-size:11px;text-transform:uppercase;letter-spacing:1px;">Check-Out</p>
        <p style="margin:0;color:#1a0a00;font-size:13px;font-weight:600;">${checkOut}</p>
      </div>
    </div>
    <p style="margin:14px 0 0;text-align:center;color:#d97706;font-weight:600;font-size:14px;">
      Total Stay: ${nights} Night${nights !== 1 ? "s" : ""}
    </p>
  </div>

  <!-- BILL BREAKDOWN -->
  <div style="padding:28px 40px;border-bottom:1px solid #f0ebe0;">
    <h2 style="margin:0 0 20px;color:#1a0a00;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Bill Summary</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #f0ebe0;">
          <th style="padding:10px 0;text-align:left;color:#8a7a6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Description</th>
          <th style="padding:10px 0;text-align:center;color:#8a7a6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Nights</th>
          <th style="padding:10px 0;text-align:center;color:#8a7a6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Rate/Night</th>
          <th style="padding:10px 0;text-align:right;color:#8a7a6a;font-size:12px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #f8f4ee;">
          <td style="padding:14px 0;color:#1a0a00;font-size:14px;">${booking.room.roomType} — Room ${booking.room.roomNumber}</td>
          <td style="padding:14px 0;text-align:center;color:#1a0a00;font-size:14px;">${nights}</td>
          <td style="padding:14px 0;text-align:center;color:#1a0a00;font-size:14px;">LKR ${roomPrice.toLocaleString()}</td>
          <td style="padding:14px 0;text-align:right;color:#1a0a00;font-size:14px;font-weight:600;">LKR ${roomTotal.toLocaleString()}</td>
        </tr>
        <tr style="border-bottom:1px solid #f8f4ee;">
          <td style="padding:12px 0;color:#8a7a6a;font-size:13px;" colspan="3">Tax &amp; Service Charge (15%)</td>
          <td style="padding:12px 0;text-align:right;color:#8a7a6a;font-size:13px;">LKR ${taxAmount.toLocaleString()}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr style="background:#fdf8ef;border-radius:8px;">
          <td colspan="3" style="padding:16px 14px;color:#1a0a00;font-size:16px;font-weight:700;border-radius:8px 0 0 8px;">TOTAL AMOUNT DUE</td>
          <td style="padding:16px 14px;text-align:right;color:#d97706;font-size:18px;font-weight:700;border-radius:0 8px 8px 0;">LKR ${grandTotal.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- PAYMENT INFO -->
  <div style="padding:28px 40px;background:#fdf8ef;border-bottom:1px solid #f0ebe0;">
    <h2 style="margin:0 0 16px;color:#1a0a00;font-size:16px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Payment at Checkout</h2>
    <p style="margin:0 0 14px;color:#5a4a3a;font-size:14px;line-height:1.7;">
      You have chosen the <strong style="color:#d97706;">Pay at Checkout</strong> option.
      Please settle the full amount at the front desk on or before your checkout date.
    </p>
    <div style="background:#fff;border:1px solid #f0ebe0;border-radius:12px;padding:18px;">
      <p style="margin:0 0 10px;color:#d97706;font-weight:700;font-size:14px;">Accepted Payment Methods at Front Desk:</p>
      <p style="margin:4px 0;color:#5a4a3a;font-size:13px;">✅ Cash (LKR)</p>
      <p style="margin:4px 0;color:#5a4a3a;font-size:13px;">✅ Credit / Debit Card (Visa, Master)</p>
      <p style="margin:4px 0;color:#5a4a3a;font-size:13px;">✅ Bank Transfer</p>
    </div>
  </div>

  ${booking.specialRequests ? `
  <!-- SPECIAL REQUESTS -->
  <div style="padding:24px 40px;border-bottom:1px solid #f0ebe0;">
    <h2 style="margin:0 0 12px;color:#1a0a00;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Special Requests</h2>
    <p style="margin:0;color:#5a4a3a;font-size:13px;line-height:1.7;font-style:italic;">"${booking.specialRequests}"</p>
  </div>
  ` : ""}

  <!-- FOOTER -->
  <div style="padding:28px 40px;text-align:center;background:#1a0a00;">
    <p style="margin:0 0 8px;color:#F5A623;font-weight:700;font-size:16px;">Kadiraa Resort & Tourism</p>
    <p style="margin:0 0 6px;color:rgba(255,255,255,0.5);font-size:12px;">For any queries, please contact our front desk</p>
    <p style="margin:0;color:rgba(255,255,255,0.4);font-size:11px;">This is an automated bill notification. Please do not reply to this email.</p>
  </div>

</div>
</body>
</html>`;
}

// ─── ROOM CRUD ────────────────────────────────────────────

export async function addRoom(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    if (req.user.role != "admin") {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }
    if( req.body.roomNumber < 0){
        return res.status(400).json({ message: "Room number must be greater than 0" });
    }
    
    if(req.body.price < 0){
        return res.status(400).json({ message: "Room price must be greater than 0" });
       
    }
    const data = req.body;
    const newRoom = new Room(data);
    newRoom.save()
        .then(() => res.json({ message: "Room added successfully" }))
        .catch(() => res.status(500).json({ error: "Room addition failed" }));
}

export async function getRooms(req, res) {
    try {
        if (isItAdmin(req)) {
            const rooms = await Room.find();
            res.json(rooms);
        } else {
            const rooms = await Room.find({ availability: true });
            res.json(rooms);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get rooms" });
    }
}

export async function getRoom(req, res) {
    try {
        const key = req.params.key;
        const room = await Room.findOne({ key: key });
        if (room == null) {
            return res.status(404).json({ message: "Room not found" });
        }
        res.json(room);
    } catch (e) {
        res.status(500).json({ message: "Failed to get room" });
    }
}

export async function updateRoom(req, res) {
    try {
        if (isItAdmin(req)) {
            const key = req.params.key;
            const data = req.body;
            await Room.updateOne({ key: key }, data);
            res.json({ message: "Room updated successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to update room" });
    }
}

export async function deleteRoom(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const key = req.params.key;
        const existingBooking = await RoomBooking.findOne({ roomKey: key });
        if (existingBooking) {
            return res.status(400).json({ message: "Cannot delete room: there are existing bookings for this room" });
        }
        await Room.deleteOne({ key: key });
        res.json({ message: "Room deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete room" });
    }
}

// Search available rooms by date range + filters
export async function searchAvailableRooms(req, res) {
    try {
        const { checkIn, checkOut, guests, roomType, hotelName } = req.query;

        // Build room filter
        let roomFilter = { availability: true };
        if (roomType)   roomFilter.roomType  = roomType;
        if (hotelName)  roomFilter.hotelName = { $regex: hotelName, $options: "i" };
        if (guests)     roomFilter.capacity  = { $gte: parseInt(guests) };

        let rooms = await Room.find(roomFilter);

        // If date range provided, exclude rooms that have overlapping bookings
        if (checkIn && checkOut) {
            const checkInDate  = new Date(checkIn);
            const checkOutDate = new Date(checkOut);

            const conflictingBookings = await RoomBooking.find({
                isApproved: true,
                $or: [
                    { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
                ]
            }).distinct("roomKey");

            rooms = rooms.filter(r => !conflictingBookings.includes(r.key));
        }

        res.json(rooms);
    } catch (e) {
        res.status(500).json({ message: "Failed to search rooms" });
    }
}

// ─── BOOKING CRUD ─────────────────────────────────────────

export async function createBooking(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    try {
        const data = req.body;

        const room = await Room.findOne({ key: data.roomKey });
        if (!room) return res.status(404).json({ message: "Room not found" });
        if (!room.availability) return res.status(400).json({ message: "Room is not available" });

        const checkIn  = new Date(data.checkInDate);
        const checkOut = new Date(data.checkOutDate);

        const conflict = await RoomBooking.findOne({
            roomKey:    data.roomKey,
            isApproved: true,
            $or: [
                { checkInDate: { $lt: checkOut }, checkOutDate: { $gt: checkIn } }
            ]
        });
        if (conflict) return res.status(400).json({ message: "Room is already booked for these dates" });

        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        const booking = new RoomBooking({
            bookingId: "BK-" + Date.now(),
            userId: req.user._id || null,
            email: req.user.email,
            roomKey: data.roomKey,
            room: {
                key:        room.key,
                roomNumber: room.roomNumber,
                hotelName:  room.hotelName,
                roomType:   room.roomType,
                image:      room.images[0],
                price:      room.price
            },
            checkInDate:     checkIn,
            checkOutDate:    checkOut,
            numberOfGuests:  data.numberOfGuests  || 1,
            numberOfNights:  nights,
            specialRequests: data.specialRequests || "",
            paymentMethod:   data.paymentMethod   || "bank_deposit",
            totalAmount:     data.totalAmount,
            // Auto-approve checkout payment bookings (pay on arrival)
            isApproved:      data.paymentMethod === "checkout" ? true : false,
            paymentStatus:   data.paymentMethod === "checkout" ? "pending" : "pending"
        });

        await booking.save();
        res.json({ message: "Booking created successfully", bookingId: booking.bookingId });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Failed to create booking" });
    }
}

export async function getMyBookings(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    try {
        const bookings = await RoomBooking.find({ email: req.user.email }).sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ message: "Failed to get bookings" });
    }
}

export async function getAllBookings(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const bookings = await RoomBooking.find().sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (e) {
        res.status(500).json({ message: "Failed to get bookings" });
    }
}

export async function approveBooking(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const { bookingId } = req.params;
        await RoomBooking.updateOne(
            { bookingId: bookingId },
            { isApproved: true, paymentStatus: "verified" }
        );
        res.json({ message: "Booking approved successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to approve booking" });
    }
}

export async function rejectBooking(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const { bookingId } = req.params;
        await RoomBooking.updateOne(
            { bookingId: bookingId },
            { isApproved: false, paymentStatus: "rejected" }
        );
        res.json({ message: "Booking rejected" });
    } catch (e) {
        res.status(500).json({ message: "Failed to reject booking" });
    }
}

export async function uploadPaymentSlip(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    try {
        const { bookingId } = req.params;
        const { paymentSlip } = req.body;
        await RoomBooking.updateOne(
            { bookingId: bookingId, email: req.user.email },
            { paymentSlip: paymentSlip, paymentStatus: "pending" }
        );
        res.json({ message: "Payment slip uploaded successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to upload payment slip" });
    }
}

export async function cancelBooking(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    try {
        const { bookingId } = req.params;
        const booking = await RoomBooking.findOne({ bookingId: bookingId, email: req.user.email });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.isCancelled) return res.status(400).json({ message: "Booking is already cancelled" });
        if (booking.isApproved && booking.paymentMethod !== "checkout")
            return res.status(400).json({ message: "Cannot cancel an approved booking. Contact support." });

        // Soft-cancel: mark as cancelled and flag for admin notification
        await RoomBooking.updateOne(
            { bookingId: bookingId },
            {
                isCancelled:     true,
                cancelledByUser: true,
                cancelledAt:     new Date(),
                adminNotified:   false,
                isApproved:      false,
                paymentStatus:   "rejected"
            }
        );
        res.json({ message: "Booking cancelled successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to cancel booking" });
    }
}

// ─── ADMIN: get unread cancellation notifications ─────────
export async function getRoomCancelledNotifications(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const notifications = await RoomBooking.find(
            { cancelledByUser: true, adminNotified: false },
            { bookingId: 1, email: 1, room: 1, cancelledAt: 1, totalAmount: 1 }
        ).sort({ cancelledAt: -1 });
        res.json(notifications);
    } catch (e) {
        res.status(500).json({ message: "Failed to get notifications" });
    }
}

// ─── ADMIN: mark cancellation notification as read ────────
export async function markRoomNotificationRead(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }
        const { bookingId } = req.params;
        await RoomBooking.updateOne({ bookingId }, { adminNotified: true });
        res.json({ message: "Notification marked as read" });
    } catch (e) {
        res.status(500).json({ message: "Failed to mark notification" });
    }
}

// ─── SEND CHECKOUT BILL EMAIL (Admin only) ─────────────────
export async function sendCheckoutEmail(req, res) {
    try {
        if (!isItAdmin(req)) {
            return res.status(403).json({ message: "You are not authorized to perform this action" });
        }

        const { bookingId } = req.params;
        const booking = await RoomBooking.findOne({ bookingId });
        if (!booking) return res.status(404).json({ message: "Booking not found" });
        if (booking.paymentMethod !== "checkout") {
            return res.status(400).json({ message: "This booking does not use the checkout payment method" });
        }

        const transporter = createTransporter();

        const roomPrice  = booking.room.price;
        const nights     = booking.numberOfNights;
        const roomTotal  = roomPrice * nights;
        const taxAmount  = Math.round(roomTotal * 0.15);
        const grandTotal = roomTotal + taxAmount;
        const checkOut   = new Date(booking.checkOutDate).toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });

        const mailOptions = {
            from: `"Kadiraa Resort" <${process.env.EMAIL_USER}>`,
            to: booking.email,
            subject: `Checkout Bill — Booking ${booking.bookingId} | Kadiraa Resort`,
            html: buildCheckoutEmailHTML(booking),
            text: `
Dear Guest,

Your checkout bill for Booking ID: ${booking.bookingId}

Hotel: ${booking.room.hotelName}
Room: ${booking.room.roomNumber} (${booking.room.roomType})
Check-Out Date: ${checkOut}
Total Nights: ${nights}

--- Bill Summary ---
Room Charges (${nights} nights × LKR ${roomPrice.toLocaleString()}): LKR ${roomTotal.toLocaleString()}
Tax & Service Charge (15%): LKR ${taxAmount.toLocaleString()}
TOTAL AMOUNT DUE: LKR ${grandTotal.toLocaleString()}

Payment is due at checkout. Please visit the front desk.

Thank you for staying with Kadiraa Resort.
            `.trim()
        };

        await transporter.sendMail(mailOptions);

        // Mark email as sent
        await RoomBooking.updateOne(
            { bookingId },
            { checkoutEmailSent: true, checkoutEmailSentAt: new Date() }
        );

        res.json({
            message: "Checkout bill email sent successfully",
            sentTo: booking.email,
            totalAmount: grandTotal
        });
    } catch (e) {
        console.error("Email error:", e);
        res.status(500).json({ message: "Failed to send checkout email", error: e.message });
    }
}