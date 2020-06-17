const router = require('express').Router();
const Gradient = require('../../models/Gradient');
const handleResponse = require('../../utils/routeHelpers').handleResponse;

router.get('/:id', (req, res) => {
  Gradient.getOne(req.params.id)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

router.post('/', (req, res) => {
  const params = {
    name: req.body.name,
    start: req.body.start,
    end: req.body.end,
  };

  Gradient.create(params)
    .then(data => handleResponse(res, data))
    .catch(err => console.log(err));
});

module.exports = router;
