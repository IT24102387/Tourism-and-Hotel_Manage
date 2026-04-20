import PackageVehicle from "../models/PackageVehicle.js";
import PackageBooking from "../models/PackageBooking.js";

const isAdmin   = (req) => req.user?.role === "admin";
const isLoggedIn = (req) => req.user != null;

// ── CREATE ──────────────────────────────────────────────────────
export async function addVehicle(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const vehicle = new PackageVehicle(req.body);
        await vehicle.save();
        res.json({ message: "Vehicle added successfully", vehicle });
    } catch (e) {
        if (e.code === 11000) {
            return res.status(400).json({ message: "A vehicle with this registration number already exists." });
        }
        res.status(500).json({ message: "Failed to add vehicle", error: e.message });
    }
}

// ── GET ALL ─────────────────────────────────────────────────────
export async function getVehicles(req, res) {
    try {
        const { packageId, tourDate } = req.query;
        let filter = {};
        if (packageId) {
            filter = { assignedPackages: packageId, availability: true, status: "Available" };
        } else if (!isAdmin(req)) {
            filter = { availability: true, status: { $ne: "Maintenance" } };
        }

        // If a tourDate is provided, exclude vehicles already booked on that day
        if (tourDate) {
            const dayStart = new Date(tourDate);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(tourDate);
            dayEnd.setHours(23, 59, 59, 999);

            const bookedOnDay = await PackageBooking.find({
                "selectedVehicle.vehicleId": { $ne: null },
                tourDate: { $gte: dayStart, $lte: dayEnd },
                status: { $in: ["Pending", "Confirmed"] },
            }).select("selectedVehicle.vehicleId");

            const bookedVehicleIds = bookedOnDay
                .map((b) => b.selectedVehicle?.vehicleId)
                .filter(Boolean);

            if (bookedVehicleIds.length > 0) {
                filter._id = { $nin: bookedVehicleIds };
            }
        }

        const vehicles = await PackageVehicle.find(filter).sort({ createdAt: -1 });
        res.json(vehicles);

    } catch (e) {
        res.status(500).json({ message: "Failed to fetch vehicles" });
    }
}

// ── GET ONE ─────────────────────────────────────────────────────
export async function getVehicleById(req, res) {
    try {
        const vehicle = await PackageVehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json(vehicle);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch vehicle" });
    }
}

// ── UPDATE ──────────────────────────────────────────────────────
export async function updateVehicle(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const vehicle = await PackageVehicle.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Vehicle updated", vehicle });
    } catch (e) {
        res.status(500).json({ message: "Failed to update vehicle", error: e.message });
    }
}

// ── DELETE ──────────────────────────────────────────────────────
export async function deleteVehicle(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const vehicle = await PackageVehicle.findByIdAndDelete(req.params.id);
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Vehicle deleted" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete vehicle" });
    }
}

// ── ASSIGN TO PACKAGES ──────────────────────────────────────────
export async function assignVehicleToPackages(req, res) {
    if (!isAdmin(req)) return res.status(403).json({ message: "Admin only" });
    try {
        const { packageIds } = req.body; // array of packageId strings
        const vehicle = await PackageVehicle.findByIdAndUpdate(
            req.params.id,
            { assignedPackages: packageIds },
            { new: true }
        );
        if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
        res.json({ message: "Packages assigned", vehicle });
    } catch (e) {
        res.status(500).json({ message: "Failed to assign packages" });
    }
}
