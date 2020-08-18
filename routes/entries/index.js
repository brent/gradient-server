const router = require('express').Router();
const Entry = require('../../models/Entry');
const routeHelpers = require('../../utils/routeHelpers');
const handleResponse = routeHelpers.handleResponse;
const customResponse = routeHelpers.customResponse;

router.get('/', (req, res) => {
  const userId = req.decoded.id;

  Entry.getAll(userId)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.get('/:id', (req, res) => {
  Entry.getOne(req.params.id)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  const userId = req.decoded.id;

  Entry.create({
    userId: userId,
    color: req.body.color,
    sentiment: req.body.sentiment,
    noteContent: req.body.noteContent,
  })
    .then(data => customResponse(res, 201, data))
    .catch(err => console.log(err));
});

module.exports = router;
