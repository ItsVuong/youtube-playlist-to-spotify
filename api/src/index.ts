import express from "express";
import youtubeRoutes from "./routes/youtube.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import spotifyRoutes from "./routes/spotify.route.js";
import cookieParser from "cookie-parser"
import session from "express-session"
import cors from "cors";
import finderRoutes from "./routes/finder.route.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:8080",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser())
app.use(session({
  resave: false,
  secret: "keyboard cat",
  saveUninitialized: false,
}))

// Routes
app.use("/youtube", youtubeRoutes)
app.use("/spotify", spotifyRoutes)
app.use("/finder", finderRoutes)
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`The server is running at http://localhost:${port}`);
});
