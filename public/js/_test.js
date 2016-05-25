(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common'], function ($, common) {

        function checkEnv() {
          if (document.URL.indexOf('https://') === 0) {
            return 'https://www.ycs.com';
          } else if (document.URL.indexOf('http://') === 0) {
            return 'http://www.ycs.com';
          }
        }

        $('#fButton').on('click', function(){
            var env = checkEnv();

            console.log('parent env:', env);

            $('#iframe')[0].contentWindow.postMessage(
                {say: 'Hello!'}, 
                env // 'http://web.ycs.com'
            );

            console.debug('parent sent out message to iframe');

            $('#iframeHTTPS')[0].contentWindow.postMessage(
                {say: 'Hello HTTPS!'}, 
                env // 'http://web.ycs.com'
            );

            console.debug('parent sent out message to iframeHTTPS');
        });

        function parentReceiveMessage(event) {
          console.log('parent Window:', event);

          var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
          // if (origin !== "http://web.ycs.com") {
          if (origin !== "https://www.ycs.com" && origin !== "http://www.ycs.com") {
            return;
          }

          console.debug('parentReceiveMessage', event);

          var data = event.data;

          if (data.from === 'http') {
              $('#childMsg').text(data.reply).parent('p').removeClass('hidden');

          } else if (data.from === 'https') {
              $('#childHTTPSMsg').text(data.reply).parent('p').removeClass('hidden');
          }
        }

        $('#env').text(checkEnv());

        window.addEventListener("message", parentReceiveMessage, false);

    });
}(window.requirejs));