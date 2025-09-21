import express from "express";
import youtubeRoutes from "./routes/youtube.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import spotifyRoutes from "./routes/spotify.route.js";
import cookieParser from "cookie-parser"
import session from "express-session"

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(session({
  resave: false,
  secret: "keyboard cat",
  saveUninitialized: true,
}))

// Routes
app.use("/youtube", youtubeRoutes)
app.use("/spotify", spotifyRoutes)
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
