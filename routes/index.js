var express = require('express');
var fs = require('fs');
var path = require('path');
var util = require('util');
var config = require('../config.json')[process.env.NODE_ENV || 'debug'];

var queueRoot = config.imageDir;
var rectsFile = path.join(queueRoot, 'positive', 'rects.txt');

var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});


router.get('/service', function(req, res) {
  fs.readdir(queueRoot, function(err, files) {
    if (err) {
      res.send(err); return;
    }
    var i = 0, filename;
    while (files && i < files.length && !files[i].match(/\.jpg$/i)) { i++; }
    if (i < files.length) { filename = files[i]; }

    if (filename) {
      var data = loadImage(filename, function(data) { res.json(data) });
    }
    else {
      res.send('me no find file');
    }
  });
})

router.get('/service/:id', function (req, res) {
  var data = loadImage(req.param('id'), function(data) { res.json(data) });
});

router.post('/service', function(req, res) {
  var id = req.body.id;
  var imagePath = path.join(queueRoot, id);
  var destPath = path.join(queueRoot, req.body.class, id);
  console.log(imagePath);
  if (req.body.class === 'positive') {
    var r = req.body.rect;
    var data = util.format('%s\t%d\t%d %d %d %d\n', id, 1, r.x, r.y, r.w, r.h);
    console.log('POSITIVE', data);
    fs.appendFile(rectsFile, data, function (err) { if (err) { console.log('ERROR: ' + err); } });
  }
  else {
    console.log('NEGATIVE');
  }
  fs.rename(imagePath, destPath, function (err) { if (err) { console.log('ERROR: ' + err); } });
  res.send('OK');
});

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

module.exports = router;
