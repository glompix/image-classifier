$(function () {
  'use strict';

  // Config
  var url = 'service';

  // DOM objects
  var $loading = $('.loading');
  var template = Handlebars.compile($('#tmplImagePanel').html());

  function loadNext(startAfterId) {
    $loading.show();
    $.get(url, {
      startAfterId: startAfterId,
      count: 20,
    }, function(data) {
      $loading.hide();
      console.log(data);
      $.each(data, function(i, image) {
      });
    });
  }

  loadNext();
});
