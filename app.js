const express = require("express");
const morgan = require("morgan");
const path = require("path");
const axios = require("axios");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/assets", express.static(path.join(__dirname, "views", "assets")));
app.use(express.json());

const server = app.listen(8000, () => {
  console.log("Listening to port 8000");
});

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
  res.render("profile");
});
