const express = require("express");
const app = express();
const port = 8000;
const cors = require("cors");
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
// const db = require("./db/db");

app.use(express.static("public"));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

const userRouter = require("./routes/userRoutes.js");

app.use("/user", userRouter);

app.listen(port, function (req, res) {
  console.log("listening on port", port);
});
