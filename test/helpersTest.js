const { assert } = require('chai');

const { getUserByEmail, isEmailExist, matchEmailPassword, getUrlsByUser, isURLExistForUserID } = require('../helpers.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

const testURLs = {
  'abcdef':{
    longURL: 'https://lighthouselabs.ca',
    userID: 'userRandomID'
  },
  'pqrxyz':{
    longURL: 'https://google.ca',
    userID: 'user2RandomID'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail('user@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.equal(expectedOutput, user);
  });

  it('should not return a user with valid email', function() {
    const user = getUserByEmail('abc@example.com', testUsers);
    const expectedOutput = 'userRandomID';
    assert.notEqual(expectedOutput, user);
  });
});

describe('isEmailExist', function() {
  it('should return true if email exists', function() {
    const result = isEmailExist('user@example.com', testUsers);
    assert.equal(true, result);
  });

  it('should return false if email does not exist', function() {
    const result = isEmailExist('abc@example.com', testUsers);
    assert.equal(false, result);
  });
});

describe('matchEmailPassword', function() {
  it('should return true if email and password matches', function() {
    const result = matchEmailPassword('user@example.com', 'purple-monkey-dinosaur', testUsers);
    assert.equal(true, result);
  });

  it('should return false if email and password does not match', function() {
    const result = matchEmailPassword('abc@example.com', 'purple-monkey-dinosaur', testUsers);
    assert.equal(false, result);
  });
});

describe('getUrlsByUser', function() {
  it('should return URLs for a given user', function() {
    const result = getUrlsByUser('userRandomID', testURLs);
    const expectedOutput = 'https://lighthouselabs.ca';
    assert.equal(expectedOutput, result['abcdef'].longURL);
  });
});

describe('isURLExist', function() {
  it('should return true if URL exists', function() {
    const result = isURLExistForUserID('userRandomID', testURLs);
    assert.equal(true, result);
  });

  it('should return false if URL does exists', function() {
    const result = isURLExistForUserID('abcd', testURLs);
    assert.equal(false, result);
  });
});