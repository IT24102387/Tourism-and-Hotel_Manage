const express = require("express");
const router = express.Router();
const {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
  getAllPackagesAdmin,
} = require("../controllers/packageController");
const { protect, restrictTo } = require("../middleware/authMiddleware");

// ─────────────────────────────────────────────
//  PUBLIC ROUTES (no login required)
//  Visitors can browse packages before logging in
// ─────────────────────────────────────────────
router.get("/", getAllPackages);           // GET /api/packages
router.get("/:id", getPackageById);       // GET /api/packages/:id

// ─────────────────────────────────────────────
//  ADMIN ONLY ROUTES
// ─────────────────────────────────────────────
router.get(
  "/admin/all",
  protect,
  restrictTo("admin"),
  getAllPackagesAdmin
); // GET /api/packages/admin/all — all packages including inactive

router.post(
  "/",
  protect,
  restrictTo("admin"),
  createPackage
); // POST /api/packages

router.put(
  "/:id",
  protect,
  restrictTo("admin"),
  updatePackage
); // PUT /api/packages/:id

router.delete(
  "/:id",
  protect,
  restrictTo("admin"),
  deletePackage
); // DELETE /api/packages/:id

module.exports = router;
