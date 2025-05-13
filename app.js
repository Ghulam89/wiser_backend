const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require('node-cron');
require('dotenv').config();
const bodyParser = require("body-parser");
// const db = require("./db/db");

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

app.use(express.static("public"));
app.use('/images', express.static('images'));
// app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Routes
const userRouter = require("./routes/userRoutes.js");
const adminRouter = require("./routes/adminRoutes.js");
const roleRouter = require("./routes/roleRoutes.js");
const { user} = require("./models/index.js");
const { Op } = require("sequelize");

app.get('/screenshot', async (req, res) => {
  const { url } = req.query;
  const outputFile = path.join(__dirname, 'screenshot.png');

  if (!url || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.screenshot({ path: outputFile, fullPage: true });

    await browser.close();

    res.sendFile(outputFile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to take screenshot' });
  }
});

app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/role", roleRouter);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is working"
  });
});

cron.schedule('0 0 * * *', async () => {
  try {
    const result = await user.destroy({
      where: {
        isMarkedForDeletion: true,
        deletionDate: { [Op.lt]: new Date() }
      }
    });
    console.log(`Deleted ${result} accounts scheduled for deletion`);
  } catch (err) {
    console.error('Automatic deletion error:', err);
  }
});

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