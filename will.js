const express = require('express');
const mysql = require('mysql2');

const app = express();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost', // Your XAMPP MySQL server host
  user: 'root',      // Your MySQL username
  password: '',      // Your MySQL password (usually empty or 'root' for XAMPP)
  database: 'william' // Your database name
});

// You can optionally test the connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ' + err.message);
  } else {
    console.log('Connected to the database');
    connection.release();
  }
});

// Create an endpoint to get data from the MySQL database
app.get('/api/data', (req, res) => {
  pool.query('SELECT * FROM your_table', (err, results) => {
    if (err) {
      console.error('Error executing query: ' + err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
      console.log(results);
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
