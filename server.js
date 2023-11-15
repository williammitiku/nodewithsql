const mysql = require('mysql2');

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
