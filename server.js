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
      `https://www.youtube.com/results?search_query=${query}`
    );

    const html = response.data;

    const json = html.split("var ytInitialData = ")[1]?.split(";</script>")[0];

    if (!json) {
      return res.json({ error: "Failed to parse data" });
    }

    const data = JSON.parse(json);

    const contents =
      data.contents.twoColumnSearchResultsRenderer.primaryContents
        .sectionListRenderer.contents;

    let results = [];

    contents.forEach((section) => {
      const items = section.itemSectionRenderer?.contents || [];

      items.forEach((item) => {
        const video = item.videoRenderer;

        if (video) {
          results.push({
            title: video.title.runs[0].text,
            videoId: video.videoId,
            thumbnail: video.thumbnail.thumbnails[0].url,
            author: video.ownerText?.runs[0]?.text,
          });
        }
      });
    });

    res.json(results);

  } catch (err) {
    res.status(500).json({ error: "error fetching data" });
  }
});
