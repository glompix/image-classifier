var mysqlPool = require('./mysqlPool');
var config = require('../config.json');
var _ = require('lodash');

module.exports.add = function (data, callback) {
  mysqlPool.getConnection(function (err, c) {
    if (err) callback(err);

    var values = { set_id: data.set_id, path: data.id };
    c.query('insert into images set ?', values, function (err, result) {
      if (err) callback(err);

      var imageId = result.insertId;
      var values = [];
      for (var i = 0; i < data.rects.length; i++) {
        var r = data.rects[i];
        values.push(_.extend(r, { image_id: imageId }));
      }

      c.query('insert into rects set ?', values, function (err) {
        if (err) callback(err);
        callback();
      });
    });
  });
};
