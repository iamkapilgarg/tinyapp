const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const helper = require('./helpers');
const errorMessages = require('./constants');

const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('tiny'));
app.use(cookieSession({
  name: 'session',
  keys: ['abcd', 'efgh'],
}));

const urlDatabase = {};

const users = {};

/** Route for the home page */
app.get('/', (req, res) => {
  let cookiesUserId = req.session.userId;
  if (cookiesUserId && users[cookiesUserId]) {
    res.redirect('/urls');
    return;
  }
  res.render('login');
});

/** Route to display all the URLs */
app.get('/urls', (req, res) => {
  let cookiesUserId = req.session.userId;

  //Check if the user exists in cookies
  if (cookiesUserId && users[cookiesUserId]) {
    const templateVars = {
      urls: helper.getUrlsByUser(cookiesUserId, urlDatabase),
      username: users[cookiesUserId].email
    };
    res.render('urls_index', templateVars);
    return;
  }

  res.render('login');
});

/** Route to display create new url page */
app.get('/urls/new', (req, res) => {
  let cookiesUserId = req.session.userId;

  //Check if the user exists in cookies
  if (cookiesUserId && users[cookiesUserId]) {
    const templateVars = { username: users[cookiesUserId].email };
    res.render('urls_new', templateVars);
    return;
  }

  res.render('login');
});

/** Route to display short URL page */
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    username: users[req.session.userId].email
  };
  res.render('urls_show', templateVars);
});

/** Route to get the long URL for the give short URL */
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

/** Route for login page */
app.get('/login', (req, res) => {
  res.render('login');
});

/** Route for the registration page */
app.get('/register', (req, res) => {
  res.render('registration');
});

/** Route to create a new URL for a user */
app.post('/urls', (req, res) => {
  let randomCharacters = helper.generateRandomString(6);
  urlDatabase[randomCharacters] = {
    longURL: req.body.longURL,
    userID: req.session.userId
  };
  res.redirect('/urls/' + randomCharacters);
});

/** Route to Delete a URL from the list */
app.post('/urls/:shortURL/delete', (req, res) => {

  // delete only those URLs which belong to the the current user
  if (helper.isURLExistForUserID(req.session.userId, urlDatabase)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
    return;
  }
  res.status(403).send(errorMessages.NOT_AUTHORIZED);
});

/** Route to update the URL.*/
app.post('/urls/:shortURL', (req, res) => {

  // a user can only update its own URLs, not anyone else's
  if (helper.isURLExistForUserID(req.session.userId, urlDatabase)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
    return;
  }
  res.status(403).send(errorMessages.NOT_AUTHORIZED);
});

app.post('/login', (req, res) => {
  if (!helper.isEmailExist(req.body.email, users)) {
    res.status(403).send(errorMessages.LOGIN_FAILED);
    return;
  }
  if (!helper.matchEmailPassword(req.body.email, req.body.password, users)) {
    res.status(403).send(errorMessages.LOGIN_FAILED);
    return;
  }
  req.session.userId = helper.getUserByEmail(req.body.email, users);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userId');
  res.redirect('/login');
});

app.post('/register', (req, res) => {
  let id = helper.generateRandomString(8);
  if (!req.body.email || !req.body.password) {
    res.status(400).send(errorMessages.BLANK_EMAIL_PASSWORD);
    return;
  }
  if (helper.isEmailExist(req.body.email, users)) {
    res.status(400).send(errorMessages.EMAIL_ALREADY_EXIST);
    return;
  }
  let user = {
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10),
    id
  };
  users[id] = user;
  req.session.userId = id;
  res.redirect('/urls');
});

app.get('*', function(req, res) {
  res.status(404).send(errorMessages.ERROR_404);
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});