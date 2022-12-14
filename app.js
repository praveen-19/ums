const express = require("express");
const createHttpError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const connectFlash = require("connect-flash");
const passport = require("passport");
const connectMongo = require("connect-mongo");
const { ensureLoggedIn } = require("connect-ensure-login");
const { roles } = require("./utils/roles");

//Initialization
const app = express();
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const MongoStore = connectMongo(session);

//Init Session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      // secure: true,
      httpOnly: true,
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require("./utils/passport.auth");

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Connect Flash Messages
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

//Routes
app.use("/", require("./routes/index.route"));
app.use("/auth", require("./routes/auth.route"));
app.use(
  "/user",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  require("./routes/user.route")
);
app.use(
  "/admin",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureAdmin,
  require("./routes/admin.route")
);
app.use(
  "/manager",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureManager,
  require("./routes/manager.route")
);
app.use(
  "/teamLead",
  ensureLoggedIn({ redirectTo: "/auth/login" }),
  ensureTeamLead,
  require("./routes/teamLead.route")
);

//404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render("error_404", { error });
});

// Configure PORT
const PORT = process.env.PORT || 3000;

// Database Connection for Authentication
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //useCreateIndex: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log("Database connected successfully...");
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
  })
  .catch((error) => console.log(error.message));

// function ensureAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     next();
//   } else {
//     res.redirect("/auth/login");
//   }
// }

function ensureAdmin(req, res, next) {
  if (req.user.role === roles.admin) {
    next();
  } else {
    req.flash("warning", "You are not authorized to view the route");
    res.redirect("/");
  }
}

function ensureManager(req, res, next) {
  if (req.user.role === roles.manager) {
    next();
  } else {
    req.flash("warning", "You are not authorized to view the route");
    res.redirect("/");
  }
}

function ensureTeamLead(req, res, next) {
  if (req.user.role === roles.teamLead) {
    next();
  } else {
    req.flash("warning", "You are not authorized to view the route");
    res.redirect("/");
  }
}
