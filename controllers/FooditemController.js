import FoodItem from "../models/Fooditem.js";
import { isItAdmin } from "./userController.js";

// ── Add Food Item ──
export function addFoodItem(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    if (req.user.role != "admin") {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    const newFoodItem = new FoodItem(req.body);
    newFoodItem.save()
        .then(() => {
            res.json({ message: "Food item added successfully" });
        })
        .catch((error) => {
            console.log("Food item save error:", error.message);
            res.status(500).json({ error: error.message || "Food item addition failed" });
        });
}

// ── Get All Food Items of a Menu ──
export async function getFoodItemsByMenu(req, res) {
    try {
        const menuId = req.params.menuId;
        if (isItAdmin(req)) {
            const foodItems = await FoodItem.find({ menuId });
            res.json(foodItems);
        } else {
            const foodItems = await FoodItem.find({ menuId, availability: true });
            res.json(foodItems);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get food items" });
    }
}

// ── Get All Food Items of a Restaurant ──
export async function getFoodItemsByRestaurant(req, res) {
    try {
        const restaurantId = req.params.restaurantId;
        if (isItAdmin(req)) {
            const foodItems = await FoodItem.find({ restaurantId }).populate("menuId", "name");
            res.json(foodItems);
        } else {
            const foodItems = await FoodItem.find({ restaurantId, availability: true }).populate("menuId", "name");
            res.json(foodItems);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get food items" });
    }
}

// ── Get Single Food Item ──
export async function getFoodItem(req, res) {
    try {
        const foodItem = await FoodItem.findById(req.params.id);
        if (!foodItem) {
            return res.status(404).json({ message: "Food item not found" });
        }
        res.json(foodItem);
    } catch (e) {
        res.status(500).json({ message: "Failed to get food item" });
    }
}

// ── Update Food Item ──
export async function updateFoodItem(req, res) {
    try {
        if (isItAdmin(req)) {
            await FoodItem.updateOne({ _id: req.params.id }, req.body);
            res.json({ message: "Food item updated successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to update food item" });
    }
}

// ── Delete Food Item ──
export async function deleteFoodItem(req, res) {
    try {
        if (isItAdmin(req)) {
            await FoodItem.deleteOne({ _id: req.params.id });
            res.json({ message: "Food item deleted successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to delete food item" });
    }
}