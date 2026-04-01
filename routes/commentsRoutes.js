import { Router } from "express";
import { addCommentAndRating } from "../controllers/commentsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/comments", protect, addCommentAndRating);

export default router;
