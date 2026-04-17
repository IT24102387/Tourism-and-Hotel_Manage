import Restaurant from "../models/Restaurant.js";
import Menu from "../models/FoodMenu.js";
import FoodItem from "../models/Fooditem.js";
import { isItAdmin } from "./userController.js";

// ── Add Restaurant ──
export function addRestaurant(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    if (req.user.role != "admin") {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    const newRestaurant = new Restaurant(req.body);
    newRestaurant.save()
        .then(() => {
            res.json({ message: "Restaurant added successfully" });
        })
        .catch((error) => {
            console.log("Restaurant save error:", error.message);
            res.status(500).json({ error: error.message || "Restaurant addition failed" });
        });
}

// ── Get All Restaurants ──
export async function getRestaurants(req, res) {
    try {
        if (isItAdmin(req)) {
            const restaurants = await Restaurant.find();
            res.json(restaurants);
        } else {
            const restaurants = await Restaurant.find({ isActive: true });
            res.json(restaurants);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get restaurants" });
    }
}

// ── Get Single Restaurant ──
export async function getRestaurant(req, res) {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }
        res.json(restaurant);
    } catch (e) {
        res.status(500).json({ message: "Failed to get restaurant" });
    }
}

// ── Update Restaurant ──
export async function updateRestaurant(req, res) {
    try {
        if (isItAdmin(req)) {
            await Restaurant.updateOne({ _id: req.params.id }, req.body);
            res.json({ message: "Restaurant updated successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to update restaurant" });
    }
}

// ── Delete Restaurant (also deletes its menus and food items) ──
export async function deleteRestaurant(req, res) {
    try {
        if (isItAdmin(req)) {
            const id = req.params.id;
            // Delete all food items of this restaurant
            await FoodItem.deleteMany({ restaurantId: id });
            // Delete all menus of this restaurant
            await Menu.deleteMany({ restaurantId: id });
            // Delete the restaurant
            await Restaurant.deleteOne({ _id: id });
            res.json({ message: "Restaurant deleted successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to delete restaurant" });
    }
}