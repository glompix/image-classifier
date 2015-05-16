var Util = {};
(function () {
  Util.rectFromPoints = function (p1, p2) {
    if (!p1 || !p2) return null;

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
    return {
      x: x,
      y: y,
      w: w,
      h: h
    };
  };

  Util.translateRect = function (r, $viewport, image) {
    var viewportWidth = $viewport.width();
    var viewportHeight = $viewport.height();
    var xScale = image.width / viewportWidth;
    var yScale = image.height / viewportHeight;
    return {
      x: Math.round(r.x * xScale),
      y: Math.round(r.y * yScale),
      w: Math.round(r.w * xScale),
      h: Math.round(r.h * yScale)
    };
  };
})();
