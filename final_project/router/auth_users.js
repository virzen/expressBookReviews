const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const crypto = require("node:crypto");
const { SECRET } = require('../env.js');

let users = [];

function hashPassword(password) {
  const hasher = crypto.createHash("sha512");

  hasher.update(password);

  const hash = hasher.digest().toString("utf-8");

  return hash;
}

const isValid = (username) => {
  return users.findIndex((u) => u.username === username) === -1;
};

/**
 * @param {string} username
 * @param {string} password
 * @returns {boolean}
 */
const authenticatedUser = (username, password) => {
  const passwordHash = hashPassword(password);

  const userIndex = users.findIndex(
    (u) => u.username === username && u.passwordHash === passwordHash,
  );

  return userIndex !== -1;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
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

regd_users.post("/logout", (req, res) => {
  req.session.destroy();
  res.send();
})

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  const content = req.body.content;
  const username = req.session.username;

  if (!book) {
    res.status(400).send({ message: "Book not found" });
    return;
  }

  if (!content) {
    res.status(400).send({ message: ".content is required" });
    return;
  }

  book.reviews[username] = content;

  return res.status(200).json({ message: "Review added successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  const username = req.session.username;

  if (!book) {
    res.status(404).json({ message: "Book not found" });
    return;
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.hashPassword = hashPassword;
