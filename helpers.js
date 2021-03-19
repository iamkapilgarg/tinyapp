const bcrypt = require('bcrypt');

/**
 * returns true if the email exists in user database
 * returns false otherwise
 *
 * @param {*} email
 * @param {*} users
 * @return {*} boolean
 */
const isEmailExist = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
};

/**
 * Returns true if the email and passwords match in the user database.
 * it matches the hashed password. It also matches the plain text password but
 * plain text password won't be existing in the database.
 *
 * @param {*} email
 * @param {*} password
 * @param {*} users
 * @return {*} boolean
 */
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

/**
 * Returns user from the user database for the given email id
 *
 * @param {*} email
 * @param {*} users
 * @return {*} user object
 */
const getUserByEmail = function(email, users) {
  for (let key in users) {
    if (users[key].email === email) {
      return key;
    }
  }
};

/**
 * Returns object of only those URLs which belong to the provided user id
 *
 * @param {*} id
 * @param {*} urlDatabase
 * @return {*} URL object
 */
const getUrlsByUser = function(id, urlDatabase) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      result[key] = urlDatabase[key];
    }
  }
  return result;
};

/**
 * Returns true if URL belongs to the given user.
 *
 * @param {*} id
 * @param {*} urlDatabase
 * @return {*} boolean
 */
const isURLExistForUserID = function(UserID, urlDatabase, shortURL) {
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === UserID && key === shortURL) {
      return true;
    }
  }
  return false;
};

/**
 * Generate random strings for a given length.
 * The string will be a mix of letters and numbers.
 *
 * @param {*} length
 * @return {*} random string
 */
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