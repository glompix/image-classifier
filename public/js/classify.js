$(function() {
  'use strict';

  // Config
  var url = '/service';

  // DOM objects
  var $loading = $('.loading');
  var svg = Snap('#svg');

  // Drawing data
  var _imageData; // image displayed { id, data, width, height }
  var _imageRect, _viewportRect; // selectedRect { x, y, w, h }

  $('.submit').on('click', function() {
    $loading.show();
    var postData = {
      'id': _imageData.id,
      'class': $(this).attr('data-class'),
      'rect': _imageRect
    };
    $.post(url, postData, function(err) {
      if (!err || err === 'OK') {
        loadImage();
      } else {
        alert(err);
        $loading.hide();
      }
    });
  });

  $(window).on('hashchange', function() {
    var hash = this.location.hash;
    var filename = hash ? hash.substring(1) : '';
    if (filename) {
      if (filename === _imageData.id) {
        paint();
      } else {
        $loading.show();
        loadImage(filename);
      }
    }
  });

  function loadImage(filename) {
    console.log('LOADING', filename);
    var getUrl = url;
    if (filename) getUrl += '/' + filename;
    $.get(getUrl, function(data) {
      if (data.error) {
        alert(data.error);
      } else {
        _imageData = data;
        if (window.location.hash === '#' + _imageData.id) {
          paint();
        } else {
          window.location.hash = _imageData.id;
        }
      }
    });
  }

  function paint() {
    _imageRect = undefined;
    _viewportRect = undefined;
    svg.clear();
    svg.image(_imageData.data, 0, 0, '100%', '100%');
    $loading.hide();
  }

  function translateRect(r) {
    var $svg = $('#svg');
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
  $('.canvas').on('mousedown', function(e) {
      startDrawing(e);
      e.preventDefault();
    }).on('mouseup', function(e) {
      stopDrawing(e);
    }).on('mousemove', function(e) {
      keepDrawing(e);
    })
    // touch events
    .on('touchstart', function(e) {
      startDrawing(e.originalEvent.changedTouches[0]);
      e.preventDefault();
    }).on('touchend', function(e) {
      stopDrawing();
    }).on('touchmove', function(e) {
      keepDrawing(e.originalEvent.changedTouches[0]);
      e.preventDefault();
    });

  function startDrawing(e) {
    originPoint = {
      x: e.pageX,
      y: e.pageY
    };
    if (r) {
      r.remove();
      r = undefined;
    }
    drawing = true;
    r = svg.rect();
  }

  function keepDrawing(e) {
    if (drawing) {
      var endPoint = {
        x: e.pageX,
        y: e.pageY
      };
      createRect(originPoint, endPoint);
    }
  }

  function stopDrawing(e) {
    if (e) {
      var endPoint = {
        x: e.pageX,
        y: e.pageY
      };
      createRect(originPoint, endPoint);
    }
    drawing = false;
  }

  function createRect(p1, p2) {
    var x, y, w, h;
    if (p1.x < p2.x) {
      x = p1.x;
      w = p2.x - p1.x;
    } else {
      x = p2.x;
      w = p1.x - p2.x;
    }
    if (p1.y < p2.y) {
      y = p1.y;
      h = p2.y - p1.y;
    } else {
      y = p2.y;
      h = p1.y - p2.y;
    }
    _viewportRect = {
      x: x,
      y: y,
      w: w,
      h: h
    };
    _imageRect = translateRect(_viewportRect);
    r.attr({
      x: x,
      y: y,
      width: w,
      height: h,
      fillOpacity: 0,
      strokeWidth: 3,
      stroke: "#00ff00"
    });
    writeDebugInfo();
  }

  function writeDebugInfo() {
    var content = 'VIEW [' + _viewportRect.x + ',' + _viewportRect.y + '] ' + _viewportRect.w + 'x' + _viewportRect.h + '\nIMG  [' + _imageRect.x + ',' + _imageRect.y + '] ' + _imageRect.w + 'x' + _imageRect.h;
    $('.debug-info').html('<pre>' + content + '</pre>');
  }

  var hash = window.location.hash;
  loadImage(hash && hash.length > 1 ? hash.substring(1) : null);
});
