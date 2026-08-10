function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(400).json({ erro: err.message });
}

module.exports = { errorHandler };
