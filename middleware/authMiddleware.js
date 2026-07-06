const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    next();
  }
};

const checkUser = (req, res, next) => {
  const appToken = req.cookies.jwt;
  const backendToken = req.cookies.backendJwt;

  if (!appToken || !backendToken) {
    res.locals.user = null;
    return next();
  }

  jwt.verify(appToken, JWT_SECRET, async (err) => {
    if (err) {
      console.log(err.message);
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
            Authorization: `Bearer ${backendToken}`,
          },
        },
      );

      if (!userRes.ok) {
        console.log(`User info request failed with status ${userRes.status}`);
        res.locals.user = null;
        return next();
      }

      const user = await userRes.json();
      console.log(user);
      res.locals.user = user;
      next();
    } catch (error) {
      console.log(error.message);
      res.locals.user = null;
      next();
    }
  });
};

module.exports = { requireAuth, checkUser };
