import mongoose from "mongoose";

const addonSchema = new mongoose.Schema(
  {
    addonId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g.  "Meal", "Guide", 
    description: { type: String, default: "" },
    price: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Addon", addonSchema);
