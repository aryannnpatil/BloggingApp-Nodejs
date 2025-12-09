require('dotenv').config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("./models/blog");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const { checkForAuthenticationCookie } = require("./middlewares/authentication");

const app = express();
const PORT = process.env.PORT || 8000;

// DB CONNECTION
mongoose
  .connect(process.env.Mongo_URL, { 
    dbName: "blogapp",
  })
  .then(() => console.log("MongoDB Connected!!"))
  .catch((err) => console.error("DB Connection Error:", err));

// VIEW ENGINE
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// MIDDLEWARES
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static public folder (this is all you need)
app.use(express.static(path.resolve("./public")));

// Authentication cookie middleware
app.use(checkForAuthenticationCookie("token"));

// Make user available in ALL EJS files
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// HOME ROUTE
app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    blogs: allBlogs,
  });
});

// ROUTES
app.use("/user", userRoute);
app.use("/blog", blogRoute);

// SERVER
app.listen(PORT, () => {
  console.log(`Server Started at PORT: ${PORT}`);
});
