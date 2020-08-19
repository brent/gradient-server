"use strict";

const router = require('express').Router();
const User = require('../../models/User');
const Token = require('../../models/Token');
const routeHelpers = require('../../utils/routeHelpers');
const handleResponse = routeHelpers.handleResponse;
const errorHandler = routeHelpers.errorHandler;
const customResponse = routeHelpers.customResponse;
const requireAuth = require('../../utils/authHelpers').requireAuth;

router.post('/signup', (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  User.create(user).then(user => {
    Token.save(user.id)
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

        customResponse(res, 201, data);
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
});

router.post('/login', (req, res) => {
  const user = {
    email: req.body.email,
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
            'email': user.email,
            'gradientId': user.gradient_id,
          },
          'tokens': {
            'access': jwt,
            'refresh': refreshToken,
          },
        };

        handleResponse(res, data);
      })
      .catch(err => {
        Token.save(user.id)
          .then(res => res.token)
          .then(refreshToken => {
            const jwt = Token.generateAccessToken(user);
            const data = {
              'user': {
                'id': user.id,
                'email': user.email,
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
        console.log(err)
      });
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
    .catch(err => {
      errorHandler({
        'statusCode': 403,
        'message': err.message,
      }, req, res);
    });
});

module.exports = router;
