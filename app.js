const express = require("express");
const morgan = require("morgan");

const app = express();

app.set("view engine", "ejs");

const server = app.listen(8000, () => {
  console.log("Listening to port 8000");
});

app.get("/", (req, res) => {
  res.render("index");
});
