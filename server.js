import express from "express";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 3000;

// helper: fetch + parse YouTube results
async function fetchYouTube(query) {
  const response = await axios.get(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  );

  const html = response.data;

  const json = html.split("var ytInitialData = ")[1]?.split(";</script>")[0];

  if (!json) return null;

  return JSON.parse(json);
}

// helper: extract videos
function extractVideos(data) {
  const contents =
    data.contents.twoColumnSearchResultsRenderer.primaryContents
      .sectionListRenderer.contents;

  let results = [];

  contents.forEach((section) => {
    const items = section.itemSectionRenderer?.contents || [];

    items.forEach((item) => {
      const v = item.videoRenderer;

      if (v) {
        results.push({
          title: v.title.runs[0].text,
          videoId: v.videoId,
          thumbnail: v.thumbnail.thumbnails[0].url,
          artist: v.ownerText?.runs[0]?.text || "Unknown"
        });
      }
    });
  });

  return results;
}

// ROOT
app.get("/", (req, res) => {
  res.json({
    message: "Music API is running 🚀",
    endpoints: [
      "/search?q=",
      "/songs?q=",
      "/videos?q=",
      "/artists?q=",
      "/albums?q=",
      "/playlists?q=",
      "/suggestions?q="
    ]
  });
});

// 🔍 SEARCH (combined)
app.get("/search", async (req, res) => {
  const q = req.query.q;

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    res.json({
      query: q,
      results: results.slice(0, 15)
    });
  } catch {
    res.status(500).json({ error: "search failed" });
  }
});

// 🎵 SONGS
app.get("/songs", async (req, res) => {
  const q = req.query.q + " song";

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    res.json(results.slice(0, 10));
  } catch {
    res.status(500).json({ error: "songs failed" });
  }
});

// 🎬 VIDEOS
app.get("/videos", async (req, res) => {
  const q = req.query.q;

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    res.json(results.slice(0, 10));
  } catch {
    res.status(500).json({ error: "videos failed" });
  }
});

// 🎤 ARTISTS (approx)
app.get("/artists", async (req, res) => {
  const q = req.query.q + " artist";

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    const artists = results.map((r) => ({
      name: r.artist
    }));

    res.json(artists.slice(0, 10));
  } catch {
    res.status(500).json({ error: "artists failed" });
  }
});

// 💿 ALBUMS (approx)
app.get("/albums", async (req, res) => {
  const q = req.query.q + " album";

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    res.json(results.slice(0, 10));
  } catch {
    res.status(500).json({ error: "albums failed" });
  }
});

// 📂 PLAYLISTS (approx)
app.get("/playlists", async (req, res) => {
  const q = req.query.q + " playlist";

  try {
    const data = await fetchYouTube(q);
    const results = extractVideos(data);

    res.json(results.slice(0, 10));
  } catch {
    res.status(500).json({ error: "playlists failed" });
  }
});

// 💡 SUGGESTIONS
app.get("/suggestions", async (req, res) => {
  const q = req.query.q;

  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${q}`
    );

    const suggestions = response.data[1].map((s) => ({
      suggestion: s
    }));

    res.json(suggestions);
  } catch {
    res.status(500).json({ error: "suggestions failed" });
  }
});

app.listen(PORT, () => {
  console.log("Server running 🚀");
});
