
var fs = require('fs');
var path = require('path');
var util = require('util');
var config = require('../config.json')[process.env.NODE_ENV || 'debug'];


var queueRoot = config.imageDir;
var rectsFile = path.join(queueRoot, 'positive', 'rects.txt');

module.exports = {
  loadfile: loadImage,
  nextfile: function(callback) {
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
      }
      else {
        callback('me no find file');
      }
    });
  },
  classify: function(data, callback) {
    var imagePath = path.join(queueRoot, data.id);
    var destPath = path.join(queueRoot, data.class, data.id);
    console.log(imagePath);

    fs.rename(imagePath, destPath, function (err) {
      if (err) { callback(err); }
      else {
        var r = data.rect;
        if (r && data.class === 'positive') {
          var rectdesc = util.format('%s\t%d\t%d %d %d %d\n', data.id, 1, r.x, r.y, r.w, r.h);
          console.log('POSITIVE', rectdesc);
          fs.appendFile(rectsFile, rectdesc, function (err) {
            if (err) { fs.rename(destPath, imagePath); callback(err); }
            else { callback(null); }
          });
        }
        else {
          console.log('NEGATIVE');
          callback(null);
        }
      }
    });
  },
  declassify: function(id, callback) {
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
  }
};

function loadImage(filename, callback) {
  var filepath = path.join(queueRoot, filename);
  fs.readFile(filepath, function (err, data) {
    if (err) {
      callback({
        'error': err
      });
    }
    else {
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


var Transform = require('stream').Transform;
// Transform sctreamer to remove first line
function RemoveFirstLine(args) {
    if (! (this instanceof RemoveFirstLine)) {
        return new RemoveFirstLine(args);
    }
    Transform.call(this, args);
    this._buff = '';
    this._removed = false;
}
util.inherits(RemoveFirstLine, Transform);
RemoveFirstLine.prototype._transform = function(chunk, encoding, done) {
    if (this._removed) { // if already removed
        this.push(chunk); // just push through buffer
    } else {
        // collect string into buffer
        this._buff += chunk.toString();

        // check if string has newline symbol
        if (this._buff.indexOf('\n') !== -1) {
            // push to stream skipping first line
            this.push(this._buff.slice(this._buff.indexOf('\n') + 2));
            // clear string buffer
            this._buff = null;
            // mark as removed
            this._removed = true;
        }
    }
    done();
};