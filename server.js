const express = require("express");
const bodyParser = require("body-parser");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const app = express();
app.use(cors());
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

app.use(bodyParser.json());

const users = []; // Simulate a user database for demonstration

app.post("/set-password", async (req, res) => {
  const { password, token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Save the password as plain text (not recommended for production use)
    const newUser = { email, password };
    users.push(newUser); // Add the new user to the simulated database

    res.status(201).json({ message: "User signed up successfully" });
    console.log("User signed up successfully");
    for (let i = 0; i < users.length; i++) {
      console.log(users[i]);
    }
  } catch (error) {
    console.error("Error setting password:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

app.post("/signup", async (req, res) => {
  const { email } = req.body;
  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  const verificationLink = `http://localhost:5173/verify-email?token=${token}`;

  try {
    await mg.messages.create("mail.furqanqadri.com", {
      from: "Furqan Qadri <contact@mail.furqanqadri.com>",
      to: email,
      subject: "Welcome to Kashmir",
      text: "Testing some Mailgun awesomeness!",
      html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4CAF50;
            color: white;
            text-align: center;
            padding: 20px 0;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            text-align: center;
        }
        .content p {
            font-size: 18px;
            color: #333333;
            line-height: 1.5;
        }
        .content a {
            display: inline-block;
            margin-top: 20px;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        }
        .content a:hover {
            background-color: #45a049;
        }
        .footer {
            background-color: #f4f4f4;
            color: #888888;
            text-align: center;
            padding: 10px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Visit Kashmir</h1>
        </div>
        <div class="content">
            <p>Thank you for signing up for Visit Kashmir! Please verify your email by clicking the button below to start exploring and sharing beautiful images of Kashmir.</p>
            <a href="${verificationLink}">Verify Email</a>
        </div>
        <div class="footer">
            <p>&copy; 2023 Visit Kashmir. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`,
    });

    console.log("Email sent successfully");
    res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.error("Mailgun Error:", err);
    res.status(500).json({ error: err.message });
  }

  console.log(email);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
