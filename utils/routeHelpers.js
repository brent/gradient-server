"use strict";

const handleResponse = function(res, data) {
  customResponse(res, 200, data);
};

const customResponse = function(res, status, data) {
  res.status(status).json(data);
}

const errorHandler = function(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).send({
    'error': err.message,
  });
}

module.exports = {
  handleResponse,
  errorHandler,
};
