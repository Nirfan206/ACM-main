// middleware/error.middleware.js

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // If error has a statusCode property, use it; otherwise default to 500
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
