"use strict";

const handleResponse = function(res, data) {
  res.status(200).json({
    'data': data || { },
  });
};

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
