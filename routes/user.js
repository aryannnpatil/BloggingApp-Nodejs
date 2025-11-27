const { Router } = require("express");
const User = require("../models/user");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = Router();

const uploadPath = path.resolve("./public/profile_images");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.get("/signin", (req, res) => {
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  return res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matchPasswordANDGenerateToken(email, password);
    return res.cookie('token', token).redirect("/");
  } catch (error) {
    return res.render('signin', {
      error: "Incorrect Email or Password"
    });
  }
}); 

router.get("/logout", (req, res) => {
  res.clearCookie('token').redirect('/');
});

// ✅ FIXED: Changed profileImage to profileImageUrl to match schema
router.post("/signup", upload.single("profileImage"), async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // ✅ FIXED: Use profileImageUrl to match schema
    let profileImageUrl = "/images/default.png";  // Default value
    if (req.file) {
      profileImageUrl = `/profile_images/${req.file.filename}`;
    }

    await User.create({
      fullName,
      email,
      password,
      profileImageUrl: profileImageUrl,  // ✅ FIXED: Match schema field name
    });

    return res.redirect("/user/signin");
  } catch (err) {
    console.error("Signup error:", err);
    return res.render("signup", {
      error: "Error creating account. Email might already exist."
    });
  }
});

// ✅ Profile page route
router.get("/profile", (req, res) => {
  if (!req.user) {
    return res.redirect("/user/signin");
  }
  return res.render("profile", {
    user: req.user
  });
});

// ✅ FIXED: Profile upload route
router.post("/profile/upload", upload.single("profileImage"), async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/user/signin");
    }

    console.log("🔍 Uploading profile image...");
    console.log("User ID:", req.user._id);
    console.log("File:", req.file);

    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.error("❌ User not found!");
      return res.status(404).send("User not found");
    }

    if (req.file) {
      const newImagePath = `/profile_images/${req.file.filename}`;
      console.log("📸 New image path:", newImagePath);
      
      user.profileImageUrl = newImagePath;
      await user.save();
      
      console.log("✅ Profile image updated successfully!");
      console.log("Updated user:", user.profileImageUrl);
    } else {
      console.error("❌ No file uploaded!");
    }

    res.redirect("/user/profile");
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).send("Error uploading image: " + err.message);
  }
});

module.exports = router;