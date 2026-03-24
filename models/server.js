import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server working");
});

// main route
app.post("/api/describe", async (req, res) => {
  const { place } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: `Describe ${place} as a tourist place`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    res.json({
      description: response.data.choices[0].message.content
    });

  } catch (error) {
    console.log(error.response?.data || error.message);
    res.status(500).json({ error: "Error generating description" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));