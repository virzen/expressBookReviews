const axios = require("axios");
const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
let hashPassword = require("./auth_users.js").hashPassword;
let authenticatedUser = require("./auth_users.js").authenticatedUser;
const jwt = require("jsonwebtoken");
const { SECRET } = require('../env.js');

// Public routes for user access and book catalog lookups.
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
  res.json(books);
});

public_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  const isAuthenticated = authenticatedUser(username, password);

  if (!isAuthenticated) {
    res.status(401).send();
    return;
  }

  const token = jwt.sign({ username: username }, SECRET, { expiresIn: 60 * 60 });
  req.session.token = token;
  req.session.username = username;

  return res.status(200).json({ message: "User logged in successffully" });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;

  const book = books[isbn];

  if (!book) {
    res.status(404).send({ message: "Book not found" });
    return;
  }

  res.json(book);
});

// Find books with an exact, case-sensitive match for the requested author.
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  const booksList = Object.values(books);

  const result = booksList.filter(b => b.author === author);

  res.json(result);
});

// Find books with an exact, case-sensitive match for the requested title.
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;
  const booksList = Object.values(books);

  const result = booksList.filter(b => b.title === title);

  res.json(result);
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];

  if (!book) {
    res.status(404).send({ message: "Book not found" });
    return;
  }

  res.json(book.reviews)
});

const handleError = (message) => (error) => {
  if (error.status === 404) {
    console.error(message);
  } else {
    console.error(error);
  }
}

axios("http://localhost:5000/")
  .then(response => console.log(response.data))
  .catch(handleError("Books not found"));

axios("http://localhost:5000/author/Unknown")
  .then(response => console.log(response.data))
  .catch(handleError("Book not found by author"));

axios("http://localhost:5000/isbn/15")
  .then(response => console.log(response.data))
  .catch(handleError("Book not found by ISBN"));
  
axios("http://localhost:5000/title/Pride and Prejudice")
  .then(response => console.log(response.data))
  .catch(handleError("Book not found by title"));

module.exports.general = public_users;
