const express = require("express");
const mysql = require('mysql');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.use(bodyParser.json());

const database = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'lakshmi',
  database: 'formAssignment'
});

database.connect((error) => {
  if (error) {
    console.log('Error connecting to MySQL:', error);
    return;
  }

  console.log('Connected to MySQL');
});

/* // Create the database if it doesn't exist
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
*/


// MongoDB connection 
const connectionMongoose = "mongodb://localhost:27017/smokeTreeformassignment";
mongoose.connect(connectionMongoose, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.log("Error connecting to MongoDB", error));

// Define schema and model mongoose creart
const formSchema = new mongoose.Schema({
  name: { type: String, required: true },
  Address: { type: String, required: true }
});

const userData = mongoose.model("userData", formSchema);

// Route to add form request using MongoDB
app.post("/addformreq/mongodb", async (req, res) => {
  const { name, Address } = req.body;
  console.log("Received data:", req.body); 
  try {
    const addUser = new userData({ name, Address });
    const savedUser = await addUser.save();
    res.status(201).json({
      message: "User and address added successfully",
      user: savedUser,
    });
  } catch (error) {
    console.log("Error inserting MongoDB values:", error);
    res.status(500).json({ message: "Error inserting user in DB" });
  }
});


app.post('/addformreq', (req, res) => {
  const { name, address } = req.body; 

  const insertUserQuery = 'INSERT INTO User (name) VALUES (?)';
  database.query(insertUserQuery, [name], (err, result) => {
    if (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ message: 'Error inserting user' });
    }

    const userId = result.insertId;

    const addressFormReq = 'INSERT INTO Address (userId, address) VALUES (?, ?)';
    database.query(addressFormReq, [userId, address], (err, addressResult) => {
      if (err) {
        console.error('Error inserting address:', err);
        return res.status(500).json({ message: 'Error inserting address' });
      }

      res.status(201).json({
        message: 'User and address added successfully',
        userId: userId,
        addressId: addressResult.insertId
      });
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
