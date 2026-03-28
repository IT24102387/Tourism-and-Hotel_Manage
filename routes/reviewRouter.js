import express from "express";
import {
    addReview,
    getReviews,
    getUserReviews,
    updateReview,
    deleteReviewById,
    approveReviewById,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

reviewRouter.post("/", addReview);                         // POST /api/reviews
reviewRouter.get("/", getReviews);                         // GET /api/reviews
reviewRouter.get("/my-reviews", getUserReviews);           // GET /api/reviews/my-reviews
reviewRouter.put("/:id", updateReview);                    // PUT /api/reviews/:id
reviewRouter.delete("/:id", deleteReviewById);             // DELETE /api/reviews/:id
reviewRouter.put("/:id/approve", approveReviewById);       // PUT /api/reviews/:id/approve

export default reviewRouter;