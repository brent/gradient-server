"use strict";

const router = require('express').Router();
const User = require('../../models/User');
const handleResponse = require('../../utils/routeHelpers').handleResponse;

router.get('/', (req, res) => {
  User.getAll()
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.get('/:id', (req, res) => {
  User.get(req.params.id)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  const params = {
    email: req.body.email,
    password: req.body.password,
  };

  User.create(params)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.put('/:id', (req, res) => {
  const params = { 
    id: req.params.id, 
    email: req.body.email,
    password: req.body.password,
  };

  User.update(params)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

module.exports = router;
