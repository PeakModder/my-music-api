import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("API is working 🚀");
});

app.get("/search", async (req, res) => {
  const query = req.query.q;

  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${query}`
    );

    const results = response.data[1].map((item) => ({
      title: item
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "error" });
  }
});

app.listen(PORT, () => {
  console.log("Server running...");
});
