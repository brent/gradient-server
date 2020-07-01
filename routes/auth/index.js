"use strict";

const router = require('express').Router();
const User = require('../../models/User');
const Token = require('../../models/Token');
const handleResponse = require('../../utils/routeHelpers').handleResponse;
const requireAuth = require('../../utils/authHelpers').requireAuth;

router.post('/signup', (req, res) => {
  const user = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  };

  User.create(user).then(user => {
    Token.saveTokenForUser(user.id)
      .then((res) => res.token)
      .then((refreshToken) => {
        const jwt = Token.generateAccessToken(user);
        const data = {
          user,
          'tokens': {
            'access': jwt,
            'refresh': refreshToken,
          },
        };

        handleResponse(res, data);
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

router.post('/login', (req, res) => {
  const user = {
    username: req.body.username,
    password: req.body.password,
  };

  User.comparePassword(user).then(user => {
    Token.findTokenForUser(user.id)
      .then((res) => res.token)
      .then((refreshToken) => {
        const jwt = Token.generateAccessToken(user);
        const data = {
          'user': {
            'id': user.id,
            'username': user.username,
            'gradientId': user.gradient_id,
          },
          'tokens': {
            'access': jwt,
            'refresh': refreshToken,
          },
        };

        handleResponse(res, data);
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

router.post('/token', (req, res) => {
  const oldAccessToken = req.body.access;
  const oldRefreshToken = req.body.refreshToken;

  Token.updateRefreshToken(oldAccessToken, oldRefreshToken)
    .then(({ token, user_id }) => {
      const jwt = Token.generateAccessToken({ id: user_id });
      const data = {
        'access': jwt,
        'refresh': token,
      };

      handleResponse(res, data);
    })
    .catch(err => console.log(err))
});

module.exports = router;
