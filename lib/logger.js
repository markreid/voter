// logger

const winston = require('winston');

const config = require('../config');

winston.level = config.LOG_LEVEL;

module.exports = winston;
