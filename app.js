/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
// Import routes
const authRouter = require("./routes/auth");

const streamIntuneCMDData = require("./intune-script");
const WebSocket = require("ws");
const http = require("http");
const context = require("./context");
const { createNestedDir } = require("./utils");
// initialize express
var app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const hbs = require("hbs");

// Register the helper
hbs.registerHelper("eq", function (a, b) {
  return a === b;
});
// Register a 'log' helper to log values to the console
hbs.registerHelper("log", function (value) {
  console.log(value);
  return "";
});
/**
 * Using express-session middleware for persistent user session. Be sure to
 * familiarize yourself with available options. Visit: https://www.npmjs.com/package/express-session
 */
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // set this to true on production
    },
  })
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Routes registered
app.use("/auth", authRouter);
app.use("/", (req, res, next) => {
  const tenantId = req.session.account?.tenantId;
  // Update the base file path
  const baseFilePath = `C:/Users/sunil`;
  // Tenant specific storage path
  const tenantStoragePath = `DSC/INTUNE/${tenantId}_EXPORT/INTUNE_CONFIG`;
  req.session.tenantStoragePath = tenantStoragePath;
  req.session.baseFilePath = baseFilePath;
  next();
});

function isAuthenticated(req, res, next) {
  if (!req.session.isAuthenticated) {
    return res.redirect("/login"); // redirect to login route
  }
  next();
}

app.get("/login", (req, res, next) => {
  res.render("login", { ...context });
});

app.get("/export-intune-config", isAuthenticated, function (req, res, next) {
  // Create required file directory
  createNestedDir(req.session.tenantStoragePath);
  const fileName = `intuneConfig.ps1`;
  const path = `${req.session.baseFilePath}/${req.session.tenantStoragePath}`;
  // Send terminal output to client
  wss.on("connection", (ws) => {
    console.log("WebSocket connection established");
    // Start streaming data to WebSocket client
    streamIntuneCMDData(ws, res, path, fileName);
  });
  res.render("export-intune-config", {
    ...context,
    username: req.session.account?.username,
    activeHref: "http://localhost:3000/export-intune-config",
    title: "Get Intune Config",
  });
});

app.get("/download-intune-config", isAuthenticated, function (req, res, next) {
  const filePath = `${req.session.baseFilePath}/${req.session.tenantStoragePath}/intuneConfig.ps1`;

  // Use res.download() to send the file to the client
  res.download(filePath, function (err) {
    if (err) {
      console.error("Error downloading the file:", err);
      next(err);
    } else {
      console.log("File sent successfully.");
    }
  });
});

app.get("/", isAuthenticated, function (req, res, next) {
  res.render("overview", {
    ...context,
    activeHref: "http://localhost:3000",
    username: req.session.account?.username,
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

server.listen(3000);
console.log("server running on port 3000");
