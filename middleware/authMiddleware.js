const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const clearAuthCookies = (res) => {
  res.clearCookie("jwt", { path: "/" });
};

const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    res.locals.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err) => {
    if (err) {
      console.log(err.message);
      clearAuthCookies(res);
      res.locals.user = null;
      return next();
    }

    try {
      const userRes = await fetch(
        "https://smart-antenna-django-backend.onrender.com/api/userinfo/",
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!userRes.ok) {
        console.log(`User info request failed with status ${userRes.status}`);
        res.locals.user = null;
        return next();
      }

      const user = await userRes.json();
      const date = new Date(user.date_joined);
      const year = date.getFullYear();
      const month = date.toLocaleDateString("en-US", { month: "long" }); // "July"
      const day = date.getDate();
      user.date_joined = `${year}/${month}/${day}`;
      res.locals.user = user;
      next();
    } catch (error) {
      console.log(error.message);
      res.locals.user = null;
      next();
    }
  });
};

module.exports = { checkUser };
