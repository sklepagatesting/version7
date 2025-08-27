// index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve index.html (put the file beside index.js)
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // ensure .env has GEMINI_API_KEY=...

app.post("/api/chat", async (req, res) => {
  try {
    const prompt = (req.body?.prompt ?? "").toString();
    if (!prompt.trim()) {
      return res.status(400).send("Missing prompt");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Use Node's chunked response for streaming text
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no", // for some proxies
    });

    const result = await model.generateContentStream([prompt]);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) res.write(text);
    }
    res.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).send(err?.message || "Server error");
    } else {
      res.end();
    }
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () =>
  console.log(`Server running: http://localhost:${PORT}`)
);

