import Review from "../models/review.js";

// ADD REVIEW (rating optional)
export async function addReview(req, res) {
    if (!req.user) return res.status(401).json({ message: "Please login" });

    const data = req.body;
    data.name = `${req.user.firstName} ${req.user.lastName}`;
    data.profilePicture = req.user.profilePicture;
    data.email = req.user.email;
    // rating may be undefined → default 0
    if (data.rating === undefined) data.rating = 0;

    try {
        const newReview = new Review(data);
        await newReview.save();
        res.json({ message: "Review added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Review addition failed" });
    }
}

// GET ALL REVIEWS (admin sees all, public sees approved only)
export async function getReviews(req, res) {
    try {
        const user = req.user;
        const { sort, minRating } = req.query;

        // Build filter object
        let filter = {};
        if (!user || user.role !== "admin") {
            filter.isApproved = true;
        }
        if (minRating && !isNaN(minRating)) {
            filter.rating = { $gte: parseInt(minRating) };
        }

        // Build sort object
        let sortOption = {};
        if (sort === 'rating') {
            sortOption = { rating: -1, date: -1 };  // highest rating first, then newest
        } else {
            sortOption = { date: -1 };
        }

        const reviews = await Review.find(filter).sort(sortOption);
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to get reviews" });
    }
}

// GET USER'S OWN REVIEWS (all of them)
export async function getUserReviews(req, res) {
    if (!req.user) return res.status(401).json({ message: "Please login" });
    try {
        const reviews = await Review.find({ email: req.user.email }).sort({ date: -1 });
        res.json(reviews);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch your reviews" });
    }
}

// UPDATE REVIEW (user can update own, reset approval)
export async function updateReview(req, res) {
    const { id } = req.params;
    const { rating, comment, section } = req.body;

    if (!req.user) return res.status(401).json({ message: "Please login" });

    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        if (review.email !== req.user.email && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });

        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (section !== undefined) review.section = section;
        if (review.isApproved) review.isApproved = false; // becomes pending
        review.date = new Date();

        await review.save();
        res.json({ message: "Review updated successfully", review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Update failed" });
    }
}

// DELETE REVIEW BY ID (user or admin)
export async function deleteReviewById(req, res) {
    const { id } = req.params;
    if (!req.user) return res.status(401).json({ message: "Please login" });

    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: "Review not found" });
        if (review.email !== req.user.email && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });

        await Review.findByIdAndDelete(id);
        res.json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Deletion failed" });
    }
}

// APPROVE REVIEW BY ID (admin only)
export async function approveReviewById(req, res) {
    const { id } = req.params;
    if (!req.user || req.user.role !== "admin")
        return res.status(403).json({ message: "Admin only" });

    try {
        const review = await Review.findByIdAndUpdate(id, { isApproved: true }, { new: true });
        if (!review) return res.status(404).json({ message: "Review not found" });
        res.json({ message: "Review approved", review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Approval failed" });
    }
}