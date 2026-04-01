import { Router } from "express";
import {
  addMovieToWatchlist,
  deleteMovieFromWatchlist,
  getUserWatchlist,
  updateWatchlistItem,
} from "../controllers/watchlistsController.js";
import { protect } from "../middleware/authMiddleware.js";

const watchlistsRoutes = Router();

watchlistsRoutes.post("/movies/add-to-watchlist", protect, addMovieToWatchlist);
watchlistsRoutes.get("/movies/watchlist", protect, getUserWatchlist);
watchlistsRoutes.delete("/movies/:id", protect, deleteMovieFromWatchlist);
watchlistsRoutes.patch("/movies/:id", protect, updateWatchlistItem);

export default watchlistsRoutes;
