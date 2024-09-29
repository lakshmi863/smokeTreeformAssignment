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

// MongoDB connection 
const connectionMongoose = "mongodb://localhost:27017/smokeTreeformassignment";
mongoose.connect(connectionMongoose, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((error) => console.log("Error connecting to MongoDB", error));


const formSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  Address: { type: String, required: true }
});

const userData = mongoose.model("userData", formSchema);

// Route to add form request using MongoDB
app.post("/addformreq/mongodb", async (req, res) => {
  const { name, Address } = req.body;
  console.log("Received data:", req.body); 
  try {
    // Check for duplicate
    const existingUser = await userData.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ message: "Duplicate entry: User already exists" });
    }

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

  // Check for duplicate in MySQL
  const checkUserQuery = 'SELECT * FROM User WHERE name = ?';
  database.query(checkUserQuery, [name], (err, result) => {
    if (err) {
      console.error('Error checking for duplicate user:', err);
      return res.status(500).json({ message: 'Error checking user' });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: 'Duplicate entry: User already exists' });
    }

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
});


app.listen(3000, () => {
  console.log("Server started on port 3000");
});
