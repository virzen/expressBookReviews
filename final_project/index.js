const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const { SECRET } = require('./env.js');

const app = express();

app.use(express.json());

const sessionMiddleware = session({ secret: SECRET, resave: true, saveUninitialized: true });
app.use(
  "/customer",
  sessionMiddleware,
);
app.use("/login", sessionMiddleware);
app.use("/logout", sessionMiddleware);
app.use("/review", sessionMiddleware);

function auth(req, res, next) {
  const { session } = req;

  const { token } = session;

  if (!token) {
    res.status(401).send({ message: "You must be logged-in to use this feature" });
    return;
  }

  let result;
  try {
    result = jwt.verify(token, SECRET);
  } catch (e) {
    res.status(401).send({ message: "Invalid or expired token" });
    return;
  }

  next();
}

app.use("/logout", auth);
app.use("/review/*", auth);

const PORT = 5000;

app.use("/", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
