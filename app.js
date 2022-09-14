const express = require("express");
const createHttpError = require("http-errors");
const morgan = require("morgan");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Working");
});

app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.send(error);
});

const PORT = process.env.PORT || 3000;

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
