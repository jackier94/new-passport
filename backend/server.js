// const mysql = require("mysql");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const app = express();
// const Member = require("./member");
const User = require("./user");

// connection to mongoose

mongoose.connect(
  "mongodb+srv://jackier94:Dbz_jaqui94@cluster0.drj5e.mongodb.net/passport?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log("mongoose works????");
  }
);

// middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:3000", // This is where react app is and is connecting to it
    credentials: true,
  })
);
app.use(
  session({
    secret: "IamSecret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(cookieParser("IamSecret"));
// initializes passport and  session part of passport
app.use(passport.initialize());
app.use(passport.session());
require("./passportConfig")(passport);

//////////////////////////////end of middleware//////////////////////////////////////////////

// Routes to user page

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) res.send("no member Exists");
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send("You have been authenticated");
        console.log(req.user);
      });
    }
  })(req, res, next);
  // console.log(req.body);
});

app.post("/signup", (req, res) => {
  console.log(req.body);
  User.findOne({ username: req.body.username }, async (err, doc) => {
    if (err) throw err;
    if (doc) res.send("member already exists with this username");
    if (!doc) {
      const hashedSecurePassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new User({
        username: req.body.username,
        password: hashedSecurePassword,
      });
      await newUser.save();
      res.send("New member created");
    }
  });
});

app.get("/user", (req, res) => {
  res.send(req.user);
});

// Server listening
app.listen(4000, () => {
  console.log("server is running");
});
