const router = require('express').Router();
const Entry = require('../../models/Entry');
const handleResponse = require('../../utils/routeHelpers').handleResponse;

router.get('/', (req, res) => {
  const userId = req.decoded.userId;

  Entry.getAllForUser(userId)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.get('/:id', (req, res) => {
  Entry.getOne(req.params.id)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  const userId = req.decoded.userId;

  Entry.createForUser(userId, req.body)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

module.exports = router;
