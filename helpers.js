const bcrypt = require('bcrypt');

const isEmailExist = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

const matchEmailPassword = function(email, password, users) {
  for (let key in users) {
    if (users[key].email === email && bcrypt.compareSync(password, users[key].password)) {
      return true;
    }
    if (users[key].email === email && users[key].password === password) {
      return true;
    }
  }
  return false;
};

const getUserByEmail = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
};

const getUrlsByUser = function(id, urlDatabase) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

const isURLExistForUserID = function(id, urlDatabase) {
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      return true;
    }
  }
  return false;
};

const generateRandomString = function(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

module.exports = {
  isEmailExist,
  matchEmailPassword,
  getUserByEmail,
  generateRandomString,
  getUrlsByUser,
  isURLExistForUserID
};