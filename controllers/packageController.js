import Package from "../models/Package.js";

function isAdmin(req) {
    return req.user && req.user.role === "admin";
}

// ── CREATE ──────────────────────────────────────────────────
export async function addPackage(req, res) {
    if (!req.user) return res.status(401).json({ message: "Please login and try again" });
    if (!isAdmin(req)) return res.status(403).json({ message: "You are not authorized to perform this action" });

    try {
        const data = req.body;
        const newPackage = new Package(data);
        await newPackage.save();
        res.json({ message: "Package added successfully", package: newPackage });
    } catch (e) {
        res.status(500).json({ message: "Package addition failed", error: e.message });
    }
}

// ── READ ALL ─────────────────────────────────────────────────
export async function getPackages(req, res) {
    try {
        if (isAdmin(req)) {
            const packages = await Package.find().sort({ createdAt: -1 });
            res.json(packages);
        } else {
            const packages = await Package.find({ availability: true }).sort({ createdAt: -1 });
            res.json(packages);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get packages" });
    }
}

// ── READ ONE ─────────────────────────────────────────────────
export async function getPackageById(req, res) {
    try {
        const pkg = await Package.findOne({ packageId: req.params.packageId });
        if (!pkg) return res.status(404).json({ message: "Package not found" });
        res.json(pkg);
    } catch (e) {
        res.status(500).json({ message: "Failed to get package" });
    }
}

// ── UPDATE ───────────────────────────────────────────────────
export async function updatePackage(req, res) {
    if (!req.user) return res.status(401).json({ message: "Please login and try again" });
    if (!isAdmin(req)) return res.status(403).json({ message: "You are not authorized to perform this action" });

    try {
        const { packageId } = req.params;
        const data = req.body;
        const updated = await Package.findOneAndUpdate({ packageId }, data, { new: true });
        if (!updated) return res.status(404).json({ message: "Package not found" });
        res.json({ message: "Package updated successfully", package: updated });
    } catch (e) {
        res.status(500).json({ message: "Failed to update package", error: e.message });
    }
}

// ── DELETE ───────────────────────────────────────────────────
export async function deletePackage(req, res) {
    if (!req.user) return res.status(401).json({ message: "Please login and try again" });
    if (!isAdmin(req)) return res.status(403).json({ message: "You are not authorized to perform this action" });

    try {
        const { packageId } = req.params;
        const deleted = await Package.findOneAndDelete({ packageId });
        if (!deleted) return res.status(404).json({ message: "Package not found" });
        res.json({ message: "Package deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Failed to delete package" });
    }
}
