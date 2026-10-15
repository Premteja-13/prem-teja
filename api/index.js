const { app } = require('../server/server.js');

module.exports = (req, res) => {
  // If Vercel strips /api from req.url, add it back so Express routes match
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
};
