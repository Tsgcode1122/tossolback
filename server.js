const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const app = express();
const dbConfig = require("./db");
const roomsRoute = require("./routes/roomsRoute");
const usersRoute = require("./routes/usersRoute");
const bookingsRoute = require("./routes/bookingsRoute");

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => res.send("hotel api confirmation"));
app.use("/api/rooms", roomsRoute);
app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingsRoute);
app.use(express.static(path.join(__dirname, "build")));
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Internal Server Error");
});

const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Node Server Started using ${port}`));

module.exports = app;
