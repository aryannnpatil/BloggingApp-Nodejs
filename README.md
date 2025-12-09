# 📝 BloggingApp - Node.js

A full-stack blogging platform built using **Node.js**, **Express**, **MongoDB**, **EJS**, and **Multer**.  
Includes user authentication, blog creation, commenting, and profile management.

---

## 📂 Project Structure

```text
BloggingApp/
├── public/
│   └── uploads/            # Uploaded images
├── views/
│   ├── partials/           # Header, footer, reusable components
│   ├── blogs/              # Blog pages
│   ├── users/              # Login, signup, profile
│   └── home.ejs
├── models/
│   ├── user.js
│   └── blog.js
├── routes/
│   ├── user.js
│   └── blog.js
├── middleware/
├── app.js
├── package.json
└── README.md
