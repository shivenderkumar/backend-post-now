import express from "express";
import { getFeedPosts, getUserposts, likePost} from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// READ
router.get("/", verifyToken, getFeedPosts);
router.get("/:userID/posts", verifyToken, getUserposts);

// UPDATE
router.patch("/:id/like", verifyToken, likePost);

export default router;