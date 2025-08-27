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

// Serve everything inside "public"
app.use(express.static(path.join(__dirname, "public")));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/api/chat", async (req, res) => {
  try {
    const prompt = (req.body?.prompt ?? "").toString();
    if (!prompt.trim()) {
      return res.status(400).send("Missing prompt");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
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

app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gemini.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running: http://localhost:${PORT}`)
);


