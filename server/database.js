const mysql = require("mysql2/promise");
require("dotenv").config();

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "admin",
  database: process.env.DB_NAME || "game_data",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = db;

//fetch data from api -> goes to redis -> if this data already exists, return it -> if it doesnt, goes to mysql. -> then data goes to user