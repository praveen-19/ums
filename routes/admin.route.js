const User = require("../models/user.model");
const router = require("express").Router();
const mongoose = require("mongoose");
const { roles } = require("../utils/roles");

router.get("/users", async (req, res, next) => {
  try {
    const users = await User.find();
    // res.send(users);
    res.render("manage-users", { users });
  } catch (error) {
    next(error);
  }
});

router.get("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      req.flash("error", "Invalid ID");
      res.redirect("/admin/users");
      return;
    }
    const person = await User.findById(id);
    res.render("profile", { person });
  } catch (error) {
    next(error);
  }
});

router.post("/update-role", async (req, res, next) => {
  try {
    const { id, role } = req.body;

    //Check for id and role in req.body
    if (!id || !role) {
      req.flash("error", "Invalid Request!");
      return res.redirect("back");
    }

    //Check for valid mongoose ObjectID
    if (!mongoose.isValidObjectId(req.params.id)) {
      req.flash("error", "Invalid ID");
      return res.redirect("back");
    }

    //Check for valid role
    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash("error", "Invalid Role");
      return res.redirect("back");
    }

    //Admins cannot remove themselves from their admin role
    if (req.user.id === id) {
      req.flash(
        "error",
        "Admins cannot remove themselves from their admin role, they must seek an assistance from an another admin"
      );
      return res.redirect("back");
    }

    //Finally update the user
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    req.flash("info", `updated role for ${user.email} to ${user.role}`);
    res.redirect("back");
  } catch (error) {
    next(error);
  }
});

module.exports = router;
