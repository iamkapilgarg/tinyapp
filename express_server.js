const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const bcrypt = require('bcrypt');
const cookieSession = require("cookie-session");


const app = express();
const PORT = 8080; // default port 8080

/*The body-parser library will convert the request body from a Buffer into string that we can read.
It will then add the data to the req(request) object under the key body*/
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['abcd', 'efgh'],
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "iamkapilgarg@gmail.com",
    password: "qwerty"
  }
};

app.get("/", (req, res) => {
  let cookiesUserId = req.session.user_id;
  if (cookiesUserId && users[cookiesUserId]) {
    res.redirect("/urls");
    return;
  }
  res.render("login");
});

app.get("/urls", (req, res) => {
  let cookiesUserId = req.session.user_id;
  if (cookiesUserId && users[cookiesUserId]) {
    const templateVars = { urls: urlsForUser(cookiesUserId), username: users[cookiesUserId].email };
    res.render("urls_index", templateVars);
    return;
  }
  res.render("login");
});

app.get("/urls/new", (req, res) => {
  let cookiesUserId = req.session.user_id;
  if (cookiesUserId && users[cookiesUserId]) {
    const templateVars = { username: users[cookiesUserId].email };
    res.render("urls_new", templateVars);
    return;
  }
  res.render("login");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: users[req.session.user_id].email
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let randomCharacters = generateRandomString(6);
  urlDatabase[randomCharacters] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  res.redirect("/urls/" + randomCharacters);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (checkURL(req.session.user_id)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Not Authorized");
});

app.post("/urls/:shortURL", (req, res) => {
  if (checkURL(req.session.user_id)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
    return;
  }
  res.status(403).send("Not Authorized");
});

app.post("/login", (req, res) => {
  if (!emailExists(req.body.email)) {
    res.status(403).send("user does not exist");
    return;
  }
  if (!matchEmailPassword(req.body.email, req.body.password)) {
    res.status(403).send("wrong password");
    return;
  }
  req.session.user_id = getKey(req.body.email);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("registration");
});

app.post("/register", (req, res) => {
  let id = generateRandomString(8);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Email or password cannot be blank');
  } else if (emailExists(req.body.email)) {
    res.status(400).send('Email already exists');
  } else {
    let user = {
      'id': id,
      'email': req.body.email,
      'password': bcrypt.hashSync(req.body.password, 10)
    };
    users[id] = user;
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const emailExists = function(email) {
  for (let key in users) {
    console.log(users[key].email);
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

const matchEmailPassword = function(email, password) {
  console.log(JSON.stringify(users));
  for (let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
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

const urlsForUser = function(id) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  console.log("result" , JSON.stringify(result));
  return result;
};

const checkURL = function(id) {
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      return true;
    }
  }
  return false;
};