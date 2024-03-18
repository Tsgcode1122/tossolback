const mongoose = require("mongoose");
require("dotenv").config();
var mongoURL = process.env.MONGO_URL;

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var connection = mongoose.connection;
connection.on("error", () => {
  console.log("mongo Db connection failed");
});
connection.on("connected", () => {
  console.log("mongo Db connection  succesful");
});

module.exports = mongoose;
