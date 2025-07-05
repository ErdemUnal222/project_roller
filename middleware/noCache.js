// This middleware disables caching to ensure clients always get fresh data
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store'); // Don't store any cache
  res.setHeader('Pragma', 'no-cache');        // Legacy HTTP/1.0 cache control
  res.setHeader('Expires', '0');              // Prevent future expiration
  next(); // Continue to the next middleware or route
};

module.exports = noCache;
