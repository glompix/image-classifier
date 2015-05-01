$(function () {
  'use strict';
  var _imageData, imgRect, viewportRect;
  var url = '/service';
  var editStack = [];
  var $loading = $('.loading');
  var svg = Snap('#svg');

  $('.submit').on('click', function() {
    $loading.show();
    var postData = {
      'id': _imageData.id,
      'class': $(this).attr('data-class'),
      'rect': imgRect
    };
    console.log('POST', postData);
    $.post(url, postData, function(err) {
      console.log('POSTED', err);
      if (!err || err === 'OK') {
        editStack.push(_imageData.id);
        loadImage();
      }
      else {
        alert(err);
        $loading.hide();
      }
    });
  });

  $(window).on('hashchange', function () {
    var hash = this.location.hash;
    console.log('HASHCHANGE', hash);
    if (hash !== '#' + _imageData.id) {
      this.location.hash = '';
      loadImage(hash);
    }
  })

  function loadImage(filename) {
    console.log("LOAD", filename);
    var getUrl = url;
    if (filename) getUrl += '/' + filename;
    $.get(getUrl, function (data) {
      if (data.error) {
        alert(data.error);
      }
      else {
        _imageData = data;
        if (window.location.hash === '#' + _imageData.id) {
          console.log('PAINT', _imageData);
          svg.image(_imageData.data, 0, 0, '100%', '100%');
          $loading.hide();
        }
        else {
          window.location.hash = _imageData.id;
        }
      }
    })
  }

  function translateRect(r) {
    var $svg = $('svg');
    var viewportWidth = $svg.width();
    var viewportHeight = $svg.height();
    var xScale = _imageData.width / viewportWidth;
    var yScale = _imageData.height / viewportHeight;
    return {
      x: Math.round(r.x * xScale),
      y: Math.round(r.y * yScale),
      w: Math.round(r.w * xScale),
      h: Math.round(r.h * yScale)
    };
  }

  var originPoint;
  var r;
  var drawing = false;

  // mouse events
  $('.canvas').on('mousedown', function (e) {
    startDrawing(e);
    e.preventDefault();
  }).on('mouseup', function (e) {
    stopDrawing(e);
  }).on('mousemove', function(e) {
    keepDrawing(e);
  })
  // touch events
  .on('touchstart', function (e) {
    startDrawing(e.originalEvent.changedTouches[0]);
    e.preventDefault();
  }).on('touchend', function (e) {
    stopDrawing();
  }).on('touchmove', function(e) {
    keepDrawing(e.originalEvent.changedTouches[0]);
    e.preventDefault();
  });

  function startDrawing(e) {
    originPoint = {x: e.pageX, y: e.pageY};
    if (r) { r.remove(); r = undefined; }
    drawing = true;
    r = svg.rect();
  }
  function keepDrawing(e) {
    if (drawing) {
      var endPoint = {x: e.pageX, y: e.pageY};
      createRect(originPoint, endPoint);
    }
  }
  function stopDrawing(e) {
    if (e) {
      var endPoint = {x: e.pageX, y: e.pageY};
      createRect(originPoint, endPoint);
    }
    drawing = false;
  }

  function createRect(p1, p2) {
    var x, y, w, h;
    if (p1.x < p2.x) { x = p1.x; w = p2.x - p1.x; }
    else { x = p2.x; w = p1.x - p2.x; }
    if (p1.y < p2.y) { y = p1.y; h = p2.y - p1.y; }
    else { y = p2.y; h = p1.y - p2.y; }
    viewportRect = {x:x, y:y, w:w, h:h};
    imgRect = translateRect(viewportRect);
    r.attr({
      x: x, y: y,
      width: w, height: h,
      fillOpacity: 0,
      strokeWidth: 3,
      stroke: "#00ff00"
    });
    writeDebugInfo();
  }

  function writeDebugInfo() {
    var content = 'VIEW [' + viewportRect.x + ',' + viewportRect.y + '] ' + viewportRect.w + 'x' + viewportRect.h
      + '\nIMG  [' + imgRect.x + ',' + imgRect.y + '] ' + imgRect.w + 'x' + imgRect.h
    $('.debug-info').html('<pre>' + content + '</pre>');
  }

  var hash = window.location.hash;
  loadImage(hash ? hash.substring(1) : null);
});
