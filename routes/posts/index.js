"use strict";

const router = require('express').Router();
const Post = require('../../models/Post');
const handleResponse = require('../../utils/routeHelpers').handleResponse;

router.get('/', (req, res) => {
  Post.getAll()
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.get('/:id', (req, res) => {
  Post.get(req.params.id)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  Post.createForUser(req.body.content, req.decoded.userId)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.put('/:id', (req, res) => {
  const params = { 
    id: req.params.id, 
    content: req.body.content 
  };

  Post.updateForUser(params, req.decoded.userId)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

module.exports = router;
