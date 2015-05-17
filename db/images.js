var connection = require('./connection');
var _ = require('lodash');

module.exports.save = function (data, callback) {
  var c = connection.get();
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
};
