import { GoogleGenAI } from "@google/genai"
import type { VideoInfo } from "./youtube.service.js";

const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = new GoogleGenAI({ apiKey });

async function getSongsFromInfo(videoInfo: VideoInfo) {
  const prompt = `Extract all songs and their corresponding artists from the following YouTube video data. If the artist is not provided, look it up using your knowledge and Google Search. Return the results as a JSON array of objects, with each object having two properties: 'song_title' and 'artist_name'. If no songs or tracklist is provided, return NULL.
  
  Video Data:
  ${JSON.stringify(videoInfo, null, 2)}`;

  const response = await genAI.models.generateContent({
    model: "gemini-2.0-flash-lite",
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "object",
          properties: {
            song_title: { type: "string" },
            artist_name: { type: "string" }
          },
          required: ["song_title", "artist_name"]
        }
      }
    }
  });

  const rawText = response.text;
  if (!rawText) return null

  try {
    const jsonResponse = JSON.parse(rawText);
    return jsonResponse;
  } catch (e) {
    console.error("Failed to parse JSON from API response:", rawText);
    return null;
  }
}

export const GeminiService = { getSongsFromInfo }
