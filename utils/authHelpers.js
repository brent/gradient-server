"use strict";

const Token = require('../models/Token');

const requireAuth = (req, res, next) => {
  const [tokenType, token] = req.headers.authorization.split(' ');

  Token.decode(token)
    .then(decoded => {
      req.decoded = decoded;
      next();
    })
    .catch(err => {
      console.log(`ERROR: ${err.name}`);
      err.statusCode = 403;
      next(err);
    });
}

module.exports = {
  requireAuth,
}
