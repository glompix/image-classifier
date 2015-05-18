var mysql = require('mysql');
var config = require('../config.json');

module.exports = mysql.createPool(config.database);
