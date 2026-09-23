const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const { SECRET } = require('./env.js');

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({ secret: SECRET, resave: true, saveUninitialized: true }),
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const { session } = req;

  const { token } = session;

  if (!token) {
    res.status(401).send();
    return;
  }

  let result;
  try {
    result = jwt.verify(token, SECRET);
  } catch (e) {
    res.status(401).send()
    return;
  }

  next();
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running on port " + PORT));
