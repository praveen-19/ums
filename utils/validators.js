const { body } = require("express-validator");

module.exports = {
  registerValidator: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Invalid Email")
      .normalizeEmail()
      .toLowerCase(),
    body("password").trim().isLength(8).withMessage("Minimum 8 char required"),
    body("password2").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password do not match");
      }
      return true;
    }),
  ],
};
