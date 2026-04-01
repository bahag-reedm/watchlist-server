import Users from "../models/Users.js";
import Movies from "../models/Movies.js";
import WatchList from "../models/WatchLists.js";
import { sequelize } from "../db/db.js";

const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

export const addMovieToWatchlist = async (req, res) => {
  try {
    const userId = req.token.id;
    const { tmdbId } = req.body;

    if (!tmdbId) {
      return res.status(400).json({
        success: false,
        message: "tmdbId is required",
      });
    }

    if (!TMDB_BEARER_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "TMDB_BEARER_TOKEN is missing in environment variables",
      });
    }

    const result = await sequelize.transaction(async (t) => {
      // 1) Check user exists
      const user = await Users.findByPk(userId, { transaction: t });

      if (!user) {
        throw new Error("User not found");
      }

      // 2) Fetch full movie details from TMDB
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${tmdbId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`TMDB request failed: ${errorText}`);
      }

      const movieData = await response.json();

      // 3) Map TMDB response to your Movies table
      const mappedMovie = {
        tmdb_id: movieData.id,
        name: movieData.title || null,
        genre: movieData.genres?.map((g) => g.name).join(", ") || null,
        runtime: movieData.runtime || null,
        overall_rating:
          movieData.vote_average != null
            ? Math.round(movieData.vote_average)
            : null,
        poster_url: movieData.poster_path
          ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}`
          : null,
      };

      // 4) Save movie using tmdb_id as unique identifier
      const [movie, movieCreated] = await Movies.findOrCreate({
        where: { tmdb_id: mappedMovie.tmdb_id },
        defaults: mappedMovie,
        transaction: t,
      });

      // 5) If movie already exists, update latest fields
      if (!movieCreated) {
        await movie.update(mappedMovie, { transaction: t });
      }

      // 6) Create watchlist item if not already present
      const [watchlistItem, watchlistCreated] = await WatchList.findOrCreate({
        where: {
          user_id: userId,
          movie_id: movie.id,
        },
        defaults: {
          user_id: userId,
          movie_id: movie.id,
          watched: false,
        },
        transaction: t,
      });

      return {
        movie,
        movieCreated,
        watchlistItem,
        watchlistCreated,
      };
    });

    return res.status(result.watchlistCreated ? 201 : 200).json({
      success: true,
      message: result.watchlistCreated
        ? "Movie added to watchlist successfully"
        : "Movie already exists in watchlist",
      movie: result.movie,
      watchlist: result.watchlistItem,
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const getUserWatchlist = async (req, res) => {
  try {
    const user_id = req.token.id;

    const user = await Users.findByPk(user_id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const watchlist = await WatchList.findAll({
      where: { user_id: user_id },
      include: [
        {
          model: Movies,
          attributes: [
            "id",
            "name",
            "genre",
            "runtime",
            "overall_rating",
            "poster_url",
            "tmdb_id",
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: watchlist.length,
      watchlist,
    });
  } catch (error) {
    console.error("Get watchlist error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const deleteMovieFromWatchlist = async (req, res) => {
  const watchlist = parseInt(req.params.id, 10);

  try {
    if (!watchlist) {
      return res.status(400).json({
        success: false,
        message: "watchlistId must be valid integers",
      });
    }

    const watchlistId = await WatchList.findByPk(watchlist);
    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: "Watchlist not found",
      });
    }

    const watchlistItem = await WatchList.findOne({
      where: {
        id: watchlist,
      },
    });

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: "Movie not found in watchlist",
      });
    }

    await watchlistItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Movie removed from watchlist successfully",
    });
  } catch (error) {
    console.error("Delete watchlist movie error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

export const updateWatchlistItem = async (req, res) => {
  try {
    const watchlistId = parseInt(req.params.id, 10);
    const { watched } = req.body;

    if (!(watchlistId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid watchlistId",
      });
    }

    const watchlistItem = await WatchList.findByPk(watchlistId);

    if (!watchlistItem) {
      return res.status(404).json({
        success: false,
        message: "Watchlist item not found",
      });
    }

    await watchlistItem.update({
      watched: watched !== undefined ? watched : watchlistItem.watched,
    });

    return res.status(200).json({
      success: true,
      message: "Watchlist updated successfully",
      data: watchlistItem,
    });
  } catch (error) {
    console.error("Update watchlist error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};