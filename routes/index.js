var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');

var queueRoot = '/Users/sbranham/Projects/cylonjs-1/webcam_upload';
var rectsFile = path.join(queueRoot, 'positive', 'rects.txt');

var router = express.Router();

router.get('/', function(req, res) {
  fs.readdir(queueRoot, function(err, files) {
    var i = 0, filename;
    while (i < files.length && !files[i].match(/\.jpg$/i)) { i++; }
    if (i < files.length) { filename = files[i]; }

    if (filename) {
      var filepath = path.join(queueRoot, filename);
      fs.readFile(filepath, function (err, data) {
        if (err) { res.send(err); }
        else {
          var base64Image = new Buffer(data, 'binary').toString('base64');
          res.render('index', {
            'id': filename,
            'title': filename,
            'width': 640,
            'height': 480,
            'data': base64Image
          });
        }
      });
    }
    else {
      res.send('me no find file');
    }
  });
});

router.post('/', function(req, res) {
  var id = req.body.id;
  var imagePath = path.join(queueRoot, id);
  var destPath = path.join(queueRoot, req.body.class, id);
  console.log(imagePath);
  if (req.body.class === 'positive') {
    var r = req.body.rect;
    var data = util.format('%s\t%d\t%d %d %d %d', id, 1, r.x, r.y, r.w, r.h);
    console.log('POSITIVE', data);
    fs.appendFile(rectsFile, data, function (err) { if (err) { console.log('ERROR: ' + err); } });
  }
  else {
    console.log('NEGATIVE');
  }
  fs.rename(imagePath, destPath, function (err) { if (err) { console.log('ERROR: ' + err); } });
  res.send('OK');
});

module.exports = router;
