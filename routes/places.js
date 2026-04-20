import express from "express";
import axios from "axios";

const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

router.get("/explore", async (req, res) => {
  try {
    const { place } = req.query;

    if (!place) {
      return res.status(400).json({ error: "Place name is required" });
    }

    // Text Search (New)
    const searchRes = await axios.post(
      "https://places.googleapis.com/v1/places:searchText",
      {
        textQuery: `${place}, Sri Lanka`,
        maxResultCount: 1,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_API_KEY,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.photos,places.editorialSummary",
        },
      }
    );

    const foundPlace = searchRes.data?.places?.[0];

    if (!foundPlace) {
      return res.status(404).json({ error: "Place not found" });
    }

    const photos = foundPlace.photos || [];

    // Convert photo names to usable image URLs
    const photoUrls = photos.slice(0, 6).map((photo) => {
      return `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=800&maxWidthPx=1200&key=${GOOGLE_API_KEY}`;
    });

    let description =
      foundPlace.editorialSummary?.text ||
      `${foundPlace.displayName?.text || place} is a popular travel destination in Sri Lanka.`;

    res.json({
      name: foundPlace.displayName?.text || place,
      address: foundPlace.formattedAddress || "",
      description,
      mainImage: photoUrls[0] || "",
      gallery: photoUrls.slice(1),
    });
  } catch (error) {
    console.error(
      "Google Places error:",
      error?.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to fetch place details" });
  }
});

export default router;