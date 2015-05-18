var fs = require('fs');
var path = require('path');
var util = require('util');
var config = require('../config.json');
var imagedb = require('../db/images');

var queueRoot = config.imageDir;

module.exports.loadfile = loadImage;
module.exports.nextfile = function(callback) {
  fs.readdir(queueRoot, function(err, files) {
    if (err) {
      callback(err); return;
    }
    var i = 0, filename;
    while (files && i < files.length && !files[i].match(/\.jpg$/i)) { i++; }
    if (i < files.length) {
      filename = files[i];
    }

    if (filename) {
      var data = loadImage(filename, function(data) {
        callback(data);
      });
    } else {
      callback('me no find file');
    }
  });
};
module.exports.classify = function(data, callback) {
  var imagePath = path.join(queueRoot, data.id);
  var destPath = path.join(queueRoot, data.class, data.id);
  console.log(imagePath);

  fs.rename(imagePath, destPath, function (err) {
    if (err) { callback(err); }
    else {
      if (data.rects && data.rects.length > 0 && data.class === 'positive') {
        console.log('POSITIVE', describeRects(data));
        imagedb.add(data, function (err) {
          if (err) { fs.rename(destPath, imagePath); callback(err); }
          else { callback(); }
        });
      } else {
        console.log('NEGATIVE');
        callback();
      }
    }
  });
};
module.exports.declassify = function(id, callback) {
  var joined = 0;
  function join(err) {
    // yeah, this is bad :P
    if (err) { callback(err); }
    else if(++joined == 2) { callback(); }
  }

  var declassPath = path.join(queueRoot, id);
  var posPath = path.join(queueRoot, 'positive', id);
  fs.exists(posPath, function (exists) {
    if (!exists) { join(); }
    else {
      console.log('DECLASSIFY', posPath);
      fs.rename(posPath, declassPath, join);
      // TODO: remove rectfile entry
    }
  });

  var negPath = path.join(queueRoot, 'negative', id);
  fs.exists(negPath, function (exists) {
    if (!exists) { join(); }
    else {
      console.log('DECLASSIFY', negPath);
      fs.rename(negPath, declassPath, join);
    }
  });
};

function loadImage(filename, callback) {
  var filepath = path.join(queueRoot, filename);
  fs.readFile(filepath, function (err, data) {
    if (err) {
      callback({
        'error': err
      });
    } else {
      var base64Image = 'data:image/jpg;base64,' + new Buffer(data, 'binary').toString('base64');
      callback({
        'id': filename,
        'width': 640,
        'height': 480,
        'data': base64Image
      });
    }
  });
}

function describeRects(data) {
  var rectdesc = util.format('%s\t%d', data.id, data.rects.length);
  for (var i = 0; i < data.rects.length; i++) {
    var r = data.rects[i];
    rectdesc += util.format('\t%d %d %d %d', r.x, r.y, r.w, r.h);
  }
  return rectdesc + '\n';
}
