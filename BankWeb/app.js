// Import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

// Create an instance of the Express.js server
const app = express();

// Create a SQLite database connection
const db = new sqlite3.Database('database.db');

// Define routes and handlers
app.get('/users', (req, res) => {
  // Retrieve users from the database
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(rows);
    }
  });
});

app.post('/users', (req, res) => {
  // Extract user data from the request body
  const { name, email } = req.body;

  // Insert a new user into the database
  db.run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email], (err) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.sendStatus(201); // Created
    }
  });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
