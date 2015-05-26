$(function() {
  'use strict';

  // Config
  var url = '/classify/service';

  // DOM objects
  var $loading = $('.loading');
  var $submitPos = $('.submit-pos');
  var _svg = Snap('#svg');
  var $svg = $('#svg');

  // Drawing data
  var _rects = [];
  var _svgRects = [];
  var _imageData; // image displayed { id, data, width, height }
  var _imageRect, _viewportRect; // selectedRect { x, y, w, h }

  $submitPos.on('click tap', function() {
    console.log(_rects);
    if (_rects.length > 0) {
      submit('positive');
    }
  });

  $('.submit-neg').on('click tap', function() {
    if (_rects.length > 0) {
      popRect();
    } else {
      submit('negative');
    }
  });

  function submit(classification) {
    $loading.show();
    var postData = {
      id: _imageData.id,
      set_id: 0, // TODO
      class: classification,
      rects: _rects
    };
    $.post(url, postData, function(err) {
      if (!err || err === 'OK') {
        loadImage();
      } else {
        console.error('classify.submit', err);
        $loading.hide();
      }
    });
  }

  function popRect() {
    _rects.pop();
    r = _svgRects.pop();
    r.remove();
    console.log('POP', _rects, _svgRects);
  }
  function pushRect(rect) {
    _rects.push(rect);
    _svgRects.push(r);
    console.log('PUSH', _rects, _svgRects);
  }

  $(window).on('hashchange', function() {
    var hash = this.location.hash;
    var filename = hash ? hash.substring(1) : '';
    if (filename) {
      if (filename === _imageData.id) {
        refreshBackground();
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
        console.error('classify.loadImage', data.error);
      } else {
        _imageData = data;
        if (window.location.hash === '#' + _imageData.id) {
          refreshBackground();
        } else {
          window.location.hash = _imageData.id;
        }
      }
    });
  }

  function refreshBackground() {
    _imageRect = undefined;
    _viewportRect = undefined;
    _rects = [];
    _svgRects = [];
    _svg.clear();
    _svg.image(_imageData.data, 0, 0, '100%', '100%');
    $loading.hide();
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
      var touches = e.originalEvent.changedTouches;
      if (touches.length == 1) {
        startDrawing(e.originalEvent.changedTouches[0]);
        e.preventDefault();
      }
    }).on('touchend', function(e) {
      var touches = e.originalEvent.changedTouches;
      if (touches.length == 1) {
        stopDrawing();
      }
    }).on('touchmove', function(e) {
      var touches = e.originalEvent.changedTouches;
      if (touches.length == 1) {
        keepDrawing(e.originalEvent.changedTouches[0]);
        e.preventDefault();
      }
    });

  function startDrawing(e) {
    originPoint = {
      x: e.pageX,
      y: e.pageY
    };
    drawing = true;
    r = _svg.rect();
  }

  var rectInProgress;
  function keepDrawing(e) {
    if (drawing) {
      var endPoint = {
        x: e.pageX,
        y: e.pageY
      };
      rectInProgress = createRect(originPoint, endPoint);
    }
  }

  function stopDrawing(e) {
    var rect = rectInProgress;
    if (e && e.pageX && e.pageY) {
      var endPoint = {
        x: e.pageX,
        y: e.pageY
      };
      rect = createRect(originPoint, endPoint);
    }
    if (rect) {
      pushRect(rect);
    }
    drawing = false;
  }

  function createRect(p1, p2) {
    _viewportRect = Util.rectFromPoints(p1, p2);
    _imageRect = Util.translateRect(_viewportRect, $svg, _imageData);
    if (_imageRect.w < 20 && _imageRect.h < 20) { return; }
    r.attr({
      x: _viewportRect.x,
      y: _viewportRect.y,
      width: _viewportRect.w,
      height: _viewportRect.h,
      fillOpacity: 0,
      strokeWidth: 3,
      stroke: "#00ff00"
    });
    writeDebugInfo();
    return _imageRect;
  }

  function writeDebugInfo() {
    var content = 'VIEW [' + _viewportRect.x + ',' + _viewportRect.y + '] ' + _viewportRect.w + 'x' + _viewportRect.h + '\nIMG  [' + _imageRect.x + ',' + _imageRect.y + '] ' + _imageRect.w + 'x' + _imageRect.h;
    $('.debug-info').html('<pre>' + content + '</pre>');
  }

  var hash = window.location.hash;
  loadImage(hash && hash.length > 1 ? hash.substring(1) : null);
});
