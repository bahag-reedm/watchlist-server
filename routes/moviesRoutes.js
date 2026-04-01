import { Router } from "express";
import { searchMovies } from "../controllers/moviesController.js";
import { protect } from "../middleware/authMiddleware.js";

const moviesRoutes = Router();

moviesRoutes.get("/movies/search", protect, searchMovies);

export default moviesRoutes;