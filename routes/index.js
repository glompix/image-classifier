var express = require('express');
var util = require('util');
var rectdb = require('./rectdb');

var router = express.Router();

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/service', function(req, res) {
  rectdb.nextfile(function (data) {
    if (data) {
      res.json(data);
    }
    else {
      res.send('me no find file');
    }
  });
});

router.get('/service/:id', function (req, res) {
  var id = req.params.id;
  rectdb.declassify(id, function() {
    rectdb.loadfile(id, function(data) {
      res.json(data);
    });
  });
});

router.post('/service', function(req, res) {
  rectdb.classify(req.body, function (err) {
    res.send(err || 'OK');
  });
});


router.get('/review', function (req, res) {
  res.render('review');
});

router.get('/review/service', function (req, res) {

});

module.exports = router;
