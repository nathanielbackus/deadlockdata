const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Replace with your MySQL username
  password: 'admin',  // Replace with your MySQL password
  database: 'game_data'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
  } else {
    console.log('Connected to MySQL database');
  }
});

module.exports = db;

//fetch data from api -> goes to redis -> if this data already exists, return it -> if it doesnt, goes to mysql. -> then data goes to user