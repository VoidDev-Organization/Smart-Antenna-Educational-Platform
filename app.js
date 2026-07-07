const express = require("express");
const morgan = require("morgan");
const path = require("path");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middleware/authMiddleware");
require("dotenv").config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
const ONE_DAY_MS = 1000 * 60 * 60 * 24;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/assets", express.static(path.join(__dirname, "views", "assets")));
app.use(express.json());
app.use(cookieParser());

const server = app.listen(8000, () => {
  console.log("Listening to port 8000");
});

app.use(checkUser);
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/signup", (req, res) => {
  res.render("signup");
});
app.get("/profile", (req, res) => {
  return res.render("profile", { user: res.locals.user || null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  try {
    const backendRes = await fetch(
      "https://smart-antenna-django-backend.onrender.com/api/login/",
      {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
        headers: { "Content-type": "application/json" },
      },
    );

    const data = await backendRes.json();
    const token = data.access;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token returned by the auth service." });
    }

    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: ONE_DAY_MS,
    });

    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  return res.redirect("/");
});
