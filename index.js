const express = require("express");
const mysql = require('mysql');
const app = express();


const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lakshmi'
});


database.connect((error) => {
  if (error) {
    console.log('Error connecting to MySQL:', error);
    return;
  }

  console.log('Connected to MySQL');

  // Create the database if it doesn't exist
  const createDatabaseQuery = 'CREATE DATABASE IF NOT EXISTS formAssignment';
  database.query(createDatabaseQuery, (error) => {
    if (error) {
      console.log('Error creating database:', error);
    } else {
      console.log('Database created or already exists');


      database.changeUser({ database: 'formAssignment' }, (error) => {
        if (error) {
          console.log('Error switching to formAssignment database:', error);
          return;
        }
        
        console.log('Switched to formAssignment database');

        // Create User table
        const userTableQuery = `
          CREATE TABLE IF NOT EXISTS User (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(200) NOT NULL
          );
        `;

        database.query(userTableQuery, (error) => {
          if (error) {
            console.log('Error creating User table:', error);
          } else {
            console.log('User table created successfully');
          }
        });

        // Create Address table 
   const addressTableQuery = `
    CREATE TABLE IF NOT EXISTS Address (
      id INT AUTO_INCREMENT PRIMARY KEY,
       userId INT,
      address VARCHAR(300) NOT NULL,
     FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
          );
        `;

      database.query(addressTableQuery, (error) => {
        if (error) {
           console.log('Error creating Address table:', error);
        } else {
          console.log('Address table created successfully');
          }
        });



        
      });
    }
  });
});

// Start the Express server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
