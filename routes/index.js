"use strict";

const router = require('express').Router();
const handleResponse = require('../utils/routeHelpers.js').handleResponse;
const errorHandler = require('../utils/routeHelpers').errorHandler;
const requireAuth = require('../utils/authHelpers').requireAuth;

router.get('/', (req, res) => {
  handleResponse(res, { 'message': 'OK' });
});

router.use('/auth',                   require('./auth'));
router.use('/users',     requireAuth, require('./users'));
router.use('/gradients', requireAuth, require('./gradients'));
router.use('/entries',   requireAuth, require('./entries'));

router.use(errorHandler);

module.exports = router;
