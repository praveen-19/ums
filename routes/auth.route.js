const router = require("express").Router();

router.get("/login", async (req, res, next) => {
  res.render("login");
});

router.get("/register", async (req, res, next) => {
  res.render("Register");
});

router.post("/login", async (req, res, next) => {
  res.send("Login Post");
});

router.post("/register", async (req, res, next) => {
  res.send("Register Post");
});

router.get("/logout", async (req, res, next) => {
  res.send("Logout");
});

module.exports = router;
