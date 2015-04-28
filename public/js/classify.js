$(function () {
  var imgRect, viewportRect;
  var url = '//localhost:3000/';

  $('.submit').on('click', function() {
    var postData = {
      'id': $(this).attr('data-id'),
      'class': $(this).attr('data-class'),
      'rect': imgRect
    };
    console.log('POST', postData);
    $.post(url, postData, function(err) {
      console.log('POSTED', err);
      if (!err || err === 'OK') {
        location.reload(true);
      }
    });
  });

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
  var svg = Snap('svg');

  $('.canvas').on('mousedown', function (e) {
    originPoint = {x: e.pageX, y: e.pageY};
    if (r) { r.remove(); r = undefined; }
    drawing = true;
    r = svg.rect();
    e.preventDefault();
  }).on('mouseup', function (e) {
    var endPoint = {x: e.pageX, y: e.pageY};
    createRect(originPoint, endPoint);
    drawing = false;
  }).on('mousemove', function(e) {
    if (drawing) {
      var endPoint = {x: e.pageX, y: e.pageY};
      createRect(originPoint, endPoint);
    }
  });

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

  svg.image(_imageData.data, 0, 0, '100%', '100%');
});
