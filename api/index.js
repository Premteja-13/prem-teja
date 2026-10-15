// Vercel Serverless Function entry point
// Connects Vercel's /api routing directly to the Express application
const serverModule = require('../server/server.js');
const app = serverModule.app || serverModule;

module.exports = app;
module.exports.default = app;

