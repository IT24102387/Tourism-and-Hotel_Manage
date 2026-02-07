import express from "express";
import { addReview, approveReview, deleteReview, getReviews } from "../controllers/reviewController.js";

const reviewRouter=express.Router();
reviewRouter.post("/",addReview)
reviewRouter.get("/",getReviews)
reviewRouter.delete("/:email",deleteReview)
reviewRouter.put("/approve/:email",approveReview)

export default reviewRouter;