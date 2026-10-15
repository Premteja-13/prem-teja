const { app } = require('../server/server.js');

module.exports = (req, res) => {
  // Pass requests smoothly to Express
  return app(req, res);
};
