require("dotenv").config();

const express = require("express");
const next = require("next");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const store = new MongoDBStore({
  uri: process.env.DATABASE_URI,
  collection: "sessions",
});

store.on("error", function (error) {
  console.log(error);
});

app.prepare().then(() => {
  const server = express();

  server.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      store: store,
      cookie: {
        secure: !dev, // Set to true in production
        httpOnly: true,
        sameSite: "strict",
      },
    })
  );

  server.all("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
