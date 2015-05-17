var mysql = require('mysql');
var config = require('../config.json');
var _ = require('lodash');

var pool = mysql.createPool(config.database);

module.exports.get = function (callback) {
  return pool.getConnection(callback);
};
module.exports.getUnsafe = function (opts) {
  opts = opts || {};
  _.extend(opts, config.database, {multipleStatements: true});
  return mysql.createConnection(opts);
};
