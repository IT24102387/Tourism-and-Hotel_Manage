import Vehicle from "../models/vehicle.js";
import { isItAdmin } from "./userController.js";

// Add vehicle
export function addVehicle(req, res) {
    if (req.user == null) {
        res.status(401).json({
            message: "Please login and try again"
        });
        return;
    }
    if (req.user.role != "admin") {
        res.status(403).json({
            message: "You are not authorized to perform this action"
        });
        return;
    }

    const data = req.body;
    const newVehicle = new Vehicle(data);
    newVehicle.save()
        .then(() => {
            res.json({ message: "Vehicle added successfully" });
        })
        .catch((error) => {
            console.log("Vehicle save error:", error.message);
            res.status(500).json({ error: error.message || "Vehicle addition failed" });
        });
}

// Get all vehicles
export async function getVehicles(req, res) {
    try {
        if (isItAdmin(req)) {
            const vehicles = await Vehicle.find();
            res.json(vehicles);
            return;
        } else {
            const vehicles = await Vehicle.find({ availability: true });
            res.json(vehicles);
            return;
        }
    } catch (e) {
        res.status(500).json({
            message: "Failed to get vehicles"
        });
    }
}

// Get single vehicle
export async function getVehicle(req, res) {
    try {
        const id = req.params.id;
        const vehicle = await Vehicle.findById(id);
        if (vehicle == null) {
            res.status(404).json({
                message: "Vehicle not found"
            });
            return;
        }
        res.json(vehicle);
        return;
    } catch (e) {
        res.status(500).json({
            message: "Failed to get vehicle"
        });
    }
}

// Update vehicle
export async function updateVehicle(req, res) {
    try {
        if (isItAdmin(req)) {
            const id = req.params.id;
            const data = req.body;
            await Vehicle.updateOne({ _id: id }, data);
            res.json({
                message: "Vehicle updated successfully"
            });
        } else {
            res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Failed to update vehicle"
        });
    }
}

// Delete vehicle
export async function deleteVehicle(req, res) {
    try {
        if (isItAdmin(req)) {
            const id = req.params.id;
            await Vehicle.deleteOne({ _id: id });
            res.json({
                message: "Vehicle deleted successfully"
            });
        } else {
            res.status(403).json({
                message: "You are not authorized to perform this action"
            });
        }
    } catch (e) {
        res.status(500).json({
            message: "Failed to delete vehicle"
        });
    }
}