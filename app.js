const express = require("express");
const morgan = require("morgan");
const FormData = require("form-data");
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
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
app.get("/courses", (req, res) => {
  res.render("courses");
});
app.get("/profile", (req, res) => {
  return res.render("profile", { user: res.locals.user || null });
});

app.get("/categories", async (req, res) => {

  try{

    const categoriesRes = await fetch(process.env.DJANGO_CATEGORIES_URL, {
               
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        },
    );

  const categoriesData = await categoriesRes.json();
  res.json(categoriesData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message || "Failed to fetch categories" });
  }
});






app.get("/coursesInfo", async(req, res) => { 
  try{
        const coursesRes = await fetch(process.env.DJANGO_COURSES_URL,
         {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        },
    );

  const coursesData = await coursesRes.json();
  res.json(coursesData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message || "Failed to fetch courses" });
  }
});

app.post("/lecturesInfo", async(req, res) => { 
  try{
        const courseID = req.body.courseID;
        const lecturesRes = await fetch(process.env.DJANGO_LECTURES_URL+courseID,
         {
          method: "GET",
          headers: {
            "Content-type": "application/json",
          },
        },
    );

  const lecturesData = await lecturesRes.json();
  res.json(lecturesData);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message || "Failed to fetch lectures" });
  }
});

app.get("/course-detail", async(req, res) => {
res.render("course-detail");
}
);

app.get("/logout", (req, res) => {
  res.clearCookie("jwt", { path: "/" });
  return res.redirect("/");
});


// post routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body || {};

  try {
    const backendRes = await fetch(
      process.env.DJANGO_LOGIN_URL ,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: { "Content-type": "application/json" },
      },
    );

    const data = await backendRes.json();
    const token = data.access;
    console.log(data);

    if(data.detail){
      return res.status(401).json({ message: data.detail });
    }
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
    return res.status(500).json({Error: error.message || "Login failed" });
  }
});

app.post("/signup", async (req, res) => {
  const { first_name, last_name, username, email, password, confirm_password } = req.body;

  try {
    const backendRes = await fetch(
      process.env.DJANGO_SIGNUP_URL ,{
            method: "POST",
            body: JSON.stringify({ 
            first_name,
            last_name,
            username,
            email,
            password,
            confirm_password,}),
            headers: { "Content-type": "application/json" },
          });

    const data = await backendRes.json();

    res.json(data);

    return res.status(200).json({ message: "Signup successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ Error: error.message || "Signup failed" });
  }
});

app.post("/pfpimg", async (req, res) => {

    const user = res.locals.user;

    if (!user) {
        return res.status(401).json({
            error: "Not authenticated"
        });
    }

    try {

        const { profile_picture } = req.body;

        if (
            !profile_picture ||
            typeof profile_picture !== "string" ||
            !profile_picture.startsWith("data:image/")
        ) {
            return res.status(400).json({
                error: "Invalid image."
            });
        }

        const response = await fetch(
            process.env.DJANGO_PFP_URL ,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${req.cookies.jwt}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    profile_picture
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        return res.json(data);

    } catch (error) {

        console.error(error);

        res.status(500).json({ Error: error.message || "Failed to upload profile picture" });

    }

});