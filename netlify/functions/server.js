// Netlify Serverless Function for Express.js
// Bu dosya Netlify Functions kullanarak Express.js'i çalıştırır

const express = require('express');
const serverless = require('serverless-http');

// Server.js'den app'i import et
const app = require('../../server');

// Netlify serverless handler
exports.handler = serverless(app);

