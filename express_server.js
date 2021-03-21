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

//Middleware
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
  res.redirect('/login');
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

  res.redirect('/login');
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

  res.redirect('/login');
});



/** Route to display short URL page */
app.get('/urls/:shortURL', (req, res) => {
  let cookiesUserId = req.session.userId;
  let shortURL = req.params.shortURL;
  if (cookiesUserId && users[cookiesUserId] && urlDatabase[shortURL] && urlDatabase[shortURL].userID === cookiesUserId) {
    const templateVars = {
      longURL: urlDatabase[shortURL].longURL,
      username: users[cookiesUserId].email,
      shortURL
    };
    res.render('urls_show', templateVars);
    return;
  }
  res.status(403);
  res.render('error', {errorMessage: errorMessages.NOT_AUTHORIZED});
});



/** Route to get the long URL for the give short URL */
app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
    return;
  }
  res.status(404);
  res.render('error', {errorMessage: errorMessages.ERROR_404});
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
  let shortURL = req.params.shortURL;
  // delete only those URLs which belong to the the current user
  if (helper.isURLExistForUserID(req.session.userId, urlDatabase, shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
    return;
  }
  res.status(403).send(errorMessages.NOT_AUTHORIZED);
});



/** Route to update the URL.*/
app.post('/urls/:shortURL', (req, res) => {
  let shortURL = req.params.shortURL;
  // a user can only update its own URLs, not anyone else's
  if (helper.isURLExistForUserID(req.session.userId, urlDatabase, shortURL)) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
    return;
  }
  res.status(403).send(errorMessages.NOT_AUTHORIZED);
});



/** Route to login a user */
app.post('/login', (req, res) => {
  if (!helper.isEmailExist(req.body.email, users)) {
    res.status(403);
    res.render('error', {errorMessage: errorMessages.LOGIN_FAILED});
    return;
  }
  if (!helper.matchEmailPassword(req.body.email, req.body.password, users)) {
    res.status(403);
    res.render('error', {errorMessage: errorMessages.LOGIN_FAILED});
    return;
  }
  req.session.userId = helper.getUserByEmail(req.body.email, users);
  res.redirect('/urls');
});



/** Route for logout */
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});



/** Route for user registration */
app.post('/register', (req, res) => {
  let id = helper.generateRandomString(8);
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.render('error', {errorMessage: errorMessages.BLANK_EMAIL_PASSWORD});
    return;
  }
  if (helper.isEmailExist(req.body.email, users)) {
    res.status(400);
    res.render('error', {errorMessage: errorMessages.EMAIL_ALREADY_EXIST});
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



/** Route for the 404 page */
app.get('*', function(req, res) {
  res.status(404);
  res.render('error', {errorMessage: errorMessages.ERROR_404});
});



app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});