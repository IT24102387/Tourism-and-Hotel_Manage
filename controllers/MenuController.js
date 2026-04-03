import Menu from "../models/FoodMenu.js";
import FoodItem from "../models/Fooditem.js";
import { isItAdmin } from "./userController.js";

// ── Add Menu ──
export function addMenu(req, res) {
    if (req.user == null) {
        return res.status(401).json({ message: "Please login and try again" });
    }
    if (req.user.role != "admin") {
        return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    const newMenu = new Menu(req.body);
    newMenu.save()
        .then(() => {
            res.json({ message: "Menu added successfully" });
        })
        .catch((error) => {
            console.log("Menu save error:", error.message);
            res.status(500).json({ error: error.message || "Menu addition failed" });
        });
}

// ── Get All Menus of a Restaurant ──
export async function getMenusByRestaurant(req, res) {
    try {
        const restaurantId = req.params.restaurantId;
        if (isItAdmin(req)) {
            const menus = await Menu.find({ restaurantId });
            res.json(menus);
        } else {
            const menus = await Menu.find({ restaurantId, isActive: true });
            res.json(menus);
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to get menus" });
    }
}

// ── Get Single Menu ──
export async function getMenu(req, res) {
    try {
        const menu = await Menu.findById(req.params.id);
        if (!menu) {
            return res.status(404).json({ message: "Menu not found" });
        }
        res.json(menu);
    } catch (e) {
        res.status(500).json({ message: "Failed to get menu" });
    }
}

// ── Update Menu ──
export async function updateMenu(req, res) {
    try {
        if (isItAdmin(req)) {
            await Menu.updateOne({ _id: req.params.id }, req.body);
            res.json({ message: "Menu updated successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to update menu" });
    }
}

// ── Delete Menu (also deletes its food items) ──
export async function deleteMenu(req, res) {
    try {
        if (isItAdmin(req)) {
            const id = req.params.id;
            // Delete all food items of this menu
            await FoodItem.deleteMany({ menuId: id });
            // Delete the menu
            await Menu.deleteOne({ _id: id });
            res.json({ message: "Menu deleted successfully" });
        } else {
            res.status(403).json({ message: "You are not authorized to perform this action" });
        }
    } catch (e) {
        res.status(500).json({ message: "Failed to delete menu" });
    }
}