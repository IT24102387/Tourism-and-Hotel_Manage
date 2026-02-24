import mongoose from "mongoose";
const customOptionsSchema = new mongoose.Schema({

// Three safari routes available
    routes: {

      type: [String],
      default: ["Route A - North Sector", "Route B - South Sector", "Route C - East Sector"],
    },

    // Two vehicle types
    vehicles: {
      type: [String],
      default: ["Jeep", "Van"],
    },

    // Extra charges set by admin for each selection
    // These allow admin to configure pricing add-ons
    guideExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    breakfastExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    jeepExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    vanExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    routeAExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    routeBExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    routeCExtraCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────
//  Main Package Schema
// ─────────────────────────────────────────────
const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    // "default" = fixed package, admin decides everything
    // "customised" = visitor decides route, vehicle, breakfast, guide
    packageType: {
      type: String,
      enum: ["default", "customised"],
      required: [true, "Package type is required"],
    },

    // Base price - always set by admin
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },

    // Duration of the package in days
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
    },

    // What's included in EVERY package (admin sets these)
    inclusions: {
      accommodation: {
        type: Boolean,
        default: true,
      },
      food: {
        type: Boolean,
        default: true,
      },
      yalaParkVisit: {
        type: Boolean,
        default: true,
      },
    },

    // Only populated when packageType === "customised"
    customOptions: {
      type: customOptionsSchema,
      default: null,
    },

    // Package image URL (optional, for display on frontend)
    imageUrl: {
      type: String,
      default: "",
    },

    // Admin can deactivate a package without deleting it
    isActive: {
      type: Boolean,
      default: true,
    },

    // Track which admin created this package
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Package", packageSchema);
