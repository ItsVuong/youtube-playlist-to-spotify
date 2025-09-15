import express from "express";
import youtubeRoutes from "./routes/youtube.route.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// Middleware
app.use(express.json());


// Routes
app.use("/youtube", youtubeRoutes)
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`The server is running at http://localhost:${port}`);
});
