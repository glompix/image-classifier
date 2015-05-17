var mysql = require('mysql');
var config = require('../config.json');

var pool = mysql.createPool(config.database);

module.exports.get = function (callback) {
  pool.getConnection(callback);
};
module.exports.create = function (opts) {
  opts = opts || {};
  opts.extend(config.database);
  return mysql.createConnection(opts);
};
