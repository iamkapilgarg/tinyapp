const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

/*The body-parser library will convert the request body from a Buffer into string that we can read.
It will then add the data to the req(request) object under the key body*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('tiny'));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  console.log(JSON.stringify(users));
  const templateVars = { urls: urlDatabase,  username: users[req.cookies["user_id"]].email };
  res.render("urls_index", templateVars); //EJS will automatically search this file in views folder.
});

app.get("/urls/new", (req, res) => {
  console.log(JSON.stringify(users));
  const templateVars = {username: users[req.cookies["user_id"]].email};
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: users[req.cookies["user_id"]].email};
  res.render("urls_show", templateVars); //EJS will automatically search this file in views folder.
});

app.post("/urls", (req, res) => {
  let randomCharacters = generateRandomString(6);
  urlDatabase[randomCharacters] = req.body.longURL;
  res.redirect("/urls/" + randomCharacters);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("kapil", req.params.shortURL);
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  console.log(users);
  if (!emailExists(req.body.email)) {
    res.status(403).send("user does not exist");
    return;
  }
  if (!matchEmailPassword(req.body.email, req.body.password)) {
    res.status(403).send("wrong password");
    return;
  }
  res.cookie("user_id", getKey(req.body.email));
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login", {username:""});
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("registration",{username:""});
});

app.post("/register", (req, res) => {
  let id = generateRandomString(8);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email or password cannot be blank');
  } else if (emailExists(req.body.email)) {
    res.status(400).send('Email already exists');
  } else {
    let user = {'id': id,
      'email': req.body.email,
      'password': req.body.password
    };
    users[id] = user;
    console.log(users);
    res.cookie("user_id", id);
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const emailExists = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

const matchEmailPassword = function(email, password) {
  for (let key in users) {
    if (users[key].email === email && users[key].password === password) {
      return true;
    }
  }
  return false;
};

const getKey = function(email) {
  for (let key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
};

const generateRandomString = function(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};