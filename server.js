require('dotenv').config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  port: process.env.DB_PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

db.connect((error) => {
  if (!error) {
    console.log("Connection to database successful");
  } else {
    console.log("Failed to connect to database:", error);
  }
});

app.get("/", (req, res) => {
    res.send("Hello Everyone");
});

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});

// LOGIN
app.post("/login", (req, res) => {
  let adress = req.body.adress;
  let pass = req.body.pass;

  let qr = `SELECT * FROM user WHERE adress = ? AND pass = ?`;

  db.query(qr, [adress, pass], (error, results) => {
    if (!error) {
      if (results.length > 0) {
        return res.status(200).send({ message: "Login successful" });
      } else {
        return res
          .status(400)
          .send({ message: "Incorrect email or password." });
      }
    } else {
      return res.status(500).send({ message: "Internal server error" });
    }
  });
});

// REGISTER
app.post("/signup", (req, res) => {
  let user = req.body;
  let query = `SELECT pseudo, adress, phone, pass FROM user WHERE adress = ?`;

  db.query(query, [user.adress], (error, results) => {
    if (!error) {
      if (results.length <= 0) {
        let qr = `INSERT INTO user (pseudo, adress, phone, pass) VALUES (?, ?, ?, ?)`;
        db.query(
          qr,
          [user.pseudo, user.adress, user.phone, user.pass],
          (error, results) => {
            if (!error) {
              return res
                .status(200)
                .send({ message: "Registration successful" });
            } else {
              console.error(error);
              return res.status(500).send({ message: "Registration failed" });
            }
          }
        );
      } else {
        return res.status(400).json({ message: "Account already exists." });
      }
    } else {
      return res.status(400).json({ message: error });
    }
  });
});
