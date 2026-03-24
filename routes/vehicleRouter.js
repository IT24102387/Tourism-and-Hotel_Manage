import express from "express";
import {
    addVehicle,
    getVehicles,
    getVehicleById,
    updateVehicle,
    deleteVehicle,
    assignVehicleToPackages,
} from "../controllers/vehicleController.js";

const vehicleRouter = express.Router();

vehicleRouter.post("/",                                addVehicle);
vehicleRouter.get("/",                                 getVehicles);          // ?packageId=PKG-xxx for filtered
vehicleRouter.get("/:vehicleId",                       getVehicleById);
vehicleRouter.put("/:vehicleId",                       updateVehicle);
vehicleRouter.put("/:vehicleId/assign-packages",       assignVehicleToPackages);
vehicleRouter.delete("/:vehicleId",                    deleteVehicle);

export default vehicleRouter;
