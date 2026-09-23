const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let hashPassword = require("./auth_users.js").hashPassword;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { body } = req;

  if (
    !body ||
    !body.username ||
    !body.password ||
    typeof body.username !== "string" ||
    typeof body.password !== "string"
  ) {
    res.status(400).send();
    return;
  }

  if (!isValid(body.username)) {
    res.status(400).json({ message: "Username already taken" })
    return;
  }

  const passwordHash = hashPassword(body.password);
  delete body.password;

  let user = {};

  user.username = body.username;
  user.passwordHash = passwordHash;

  users.push(user);

  return res.status(200).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports.general = public_users;
