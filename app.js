const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
require('dotenv').config();
const bodyParser = require("body-parser");
// const db = require("./db/db");

app.use(express.static("public"));
app.use('/images', express.static('images'));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Routes
const userRouter = require("./routes/userRoutes.js");
app.use("/user", userRouter);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is working"
  });
});

// 404 handler (should be last)
app.use("*", (req, res) => {
  res.status(404).json({
    status: "fail",
    message: "Route not found"
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});