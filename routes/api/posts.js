const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const User = require("../../models/users");
const Profile = require("../../models/profile");
const Post = require("../../models/posts");
const checkObjectId = require("../../middleware/checkObjectId");

// @route POST /api/posts
// @desc Create a post
// @access Private

router.post(
  "/",
  [auth, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const user = await User.findById(req.user.id).select("-password");

      const post = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      await post.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route GET /api/posts
// @desc Get all posts
// @access Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server Error");
  }
});

// @route GET /api/posts/:id
// @desc Get specific post
// @access Private

router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: "Post does not exist" });
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Invalid Id" });
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route DELETE /api/posts/:id
// @desc Delete specific post
// @access Private

router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: "Post not found" });
    if (post.user != req.user.id)
      return res.status(401).json({ msg: "Unauthorized to delete post" });

    await Post.findByIdAndRemove(req.params.id);
    res.json({ msg: "Removed post" });
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route POST /api/posts/like/:id
// @desc Like a specific post
// @access Private

router.post("/like/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: "Post not found" });

    if (post.likes.filter((like) => like.user == req.user.id).length > 0)
      return res.status(400).json({ msg: "Cannot like more than once" });

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/posts/unlike/:id
// @desc Unlike a specific post
// @access Private

router.post("/unlike/:id", auth, checkObjectId("id"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: "Post not found" });

    if (post.likes.filter((like) => like.user == req.user.id).length === 0)
      return res.status(400).json({ msg: "Post has not been liked" });

    const index = post.likes.map((like) => like.user).indexOf(req.user.id);
    post.likes.splice(index, 1);
    await post.save();
    res.status(200).json(post.likes);
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route POST /api/posts/comment/:id
// @desc Comment on a post
// @access Private

router.post(
  "/comment/:id",
  [auth, [check("text", "Text is required to post comment").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.id);
      const user = await User.findById(req.user.id);
      if (!post) return res.status(400).json({ msg: "Post not found" });

      post.comments.unshift({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });

      await post.save();
      res.json(post.comments);
    } catch (err) {
      if (err.kind === "ObjectId")
        return res.status(400).json({ msg: "Post not found" });
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE /api/posts/comment/:id/:comment_id
// @desc Delete comment on a post
// @access Private

router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(400).json({ msg: "Post not found" });

    const comment = post.comments.find(
      (comment) => comment.id == req.params.comment_id
    );
    if (!comment) return res.status(400).json({ msg: "Comment not found" });

    if (comment.user != req.user.id)
      return res.status(400).json({ msg: "User not authorized" });

    const index = post.comments
      .map((comment) => comment.id)
      .indexOf(req.params.comment_id);

    post.comments.splice(index, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    if (err.kind === "ObjectId")
      return res.status(400).json({ msg: "Post not found" });
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
