const { Router } = require("express");
const multer = require("multer");
const router = Router();
const path = require("path");
const fs = require("fs");
const Blog = require("../models/blog");
const Comment = require("../models/comment");

// Define the upload path
const uploadPath = path.resolve("./public/uploads");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create folder if not exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;

  const newBlog = await Blog.create({
    title,
    body,
    createdBy: req.user._id,
    coverImageUrl: `/uploads/${req.file.filename}`,
  });

  return res.redirect(`/blog/${newBlog._id}`);
});

// ✅ FIXED: Added debugging and proper population
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id })
      .populate("createdBy");

    // 🔍 DEBUG - Check what's in the database
    console.log("=== DEBUG PROFILE IMAGES ===");
    console.log("Blog Author:", blog.createdBy.fullName);
    console.log("Blog Author Image:", blog.createdBy.profileImageUrl);
    
    if (comments.length > 0) {
      console.log("First Comment Author:", comments[0].createdBy.fullName);
      console.log("First Comment Image:", comments[0].createdBy.profileImageUrl);
    } else {
      console.log("No comments yet");
    }
    console.log("============================");

    return res.render("blog", {
      user: req.user,
      blog: blog,
      comments: comments   
    });
  } catch (error) {
    console.error("Error loading blog:", error);
    return res.status(500).send("Error loading blog");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  try {
    await Comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.redirect(`/blog/${req.params.blogId}`);
  }
});

module.exports = router;