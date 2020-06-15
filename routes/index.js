"use strict";

const router = require('express').Router();
const handleResponse = require('../utils/routeHelpers.js').handleResponse;
const errorHandler = require('../utils/routeHelpers').errorHandler;
const requireAuth = require('../utils/authHelpers').requireAuth;

router.get('/', (req, res) => {
  handleResponse(res, { 'message': 'OK' });
});

router.use('/auth', require('./auth'));
router.use('/posts', requireAuth, require('./posts'));
router.use('/users', requireAuth, require('./users'));

router.use(errorHandler);

module.exports = router;
