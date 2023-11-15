const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // Import the CORS middleware

const app = express();

// Configure the CORS middleware
app.use(cors());

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

app.use(express.json());

// Create an endpoint to insert data into the MySQL table
app.post('/api/data', (req, res) => {
  const dataToInsert = req.body;


  pool.query('INSERT INTO sales SET ?', dataToInsert, (err, result) => {
    if (err) {
      console.error('Error executing query: ' + err.message);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ message: 'Data inserted successfully' });
    }
  });
});

// Start the server
const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
