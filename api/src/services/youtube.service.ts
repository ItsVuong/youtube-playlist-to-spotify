import { spawn } from "child_process";
import path from "path";

export function getVideoInfo(videoUrl: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // point to python inside project venv
    const pythonPath = path.resolve("venv/bin/python");

    const yt = spawn(pythonPath, ["-m", "yt_dlp", "-J", videoUrl]);

    let output = "";
    let errorOutput = "";

    yt.stdout.on("data", (chunk) => (output += chunk.toString()));
    yt.stderr.on("data", (chunk) => (errorOutput += chunk.toString()));

    yt.on("close", (code) => {
      if (code !== 0) {
        return reject(errorOutput || `yt-dlp exited with code ${code}`);
      }
      try {
        resolve(JSON.parse(output));
      } catch {
        reject("Failed to parse yt-dlp output");
      }
    });
  });
}

export const YoutubeService = {getVideoInfo}
