(function ($) {
    'use strict'; 

    var parentWin;
    var parentWinHTTPS;

    function checkEnv() {
      if (document.URL.indexOf('https://') === 0) {
        return 'https';
      } else if (document.URL.indexOf('http://') === 0) {
        return 'http';
      }
    }

    function setupParentWin (evt) {
      parentWin = evt.source;
      console.debug('parentWin setup:', parentWin);
    }

    function childReceiveMessage(event) {

      console.log('child Window:', event, document.URL);

      var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
      // if (origin !== "http://web.ycs.com") {
      if ((origin !== "http://www.ycs.com" && origin !== "https://www.ycs.com") || document.URL.indexOf('http://') < 0) {
        return;
      }

      console.log('childReceiveMessage', event);
      var data = event.data;
      $('#parentMsg').text(data.say)
      $('.notInit').removeClass('hidden');
      
      setupParentWin(event);
    }


    // ========================== HTTPS


    function setupHTTPSParentWin (evt) {
      parentWinHTTPS = evt.source;
      console.debug('parentWinHTTPS setup:', parentWin);
    }

    function childHTTPSReceiveMessage(event) {

      console.log('child Window HTTPS:', event, document.URL);

      var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
      // if (origin !== "http://web.ycs.com") {
      if ((origin !== "http://www.ycs.com" && origin !== "https://www.ycs.com") || document.URL.indexOf('https://') < 0) {
        return;
      }

      console.log('childHTTPSReceiveMessage', event);
      var data = event.data;
      $('#parentMsg').text(data.say)
      $('.notInit').removeClass('hidden');
      
      setupHTTPSParentWin(event);
    }


    $('#cButton').on('click', function(){

      console.info(checkEnv(), 'cButton clicked.', parentWin, parentWinHTTPS);

      if (parentWin) {
        parentWin.postMessage(
          {
            from: 'http',
            reply: 'World!'
          },
          'http://www.ycs.com' // 'http://web.ycs.com'
        );

        console.debug('child sent out message to parentWin');
      }

      if (parentWinHTTPS) {
        parentWinHTTPS.postMessage(
          {
            from: 'https',
            reply: 'SSL World!'
          },
          'https://www.ycs.com' // 'http://web.ycs.com'
        );

        console.debug('child sent out message to parentWinHTTPS');
      }
    });


    console.info('==== EVN:', checkEnv());

    // HTTP
    if (checkEnv() === 'http') {
      window.addEventListener("message", childReceiveMessage, false);
      $('#env').text('HTTP');

    // HTTPS
    } else if (checkEnv() === 'https') {
      window.addEventListener("message", childHTTPSReceiveMessage, false);
      $('#env').text('HTTPS');
    }

}(window.jQuery));