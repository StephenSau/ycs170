(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'common', 'tab'], function ($, common) {
        function Help(){
            this.init();
        }

        Help.prototype = {
            init: function () {
                var that = this;
                $('[data-spy="tab"]').tab();
            }
        };

        var help = new Help();
    });
}(window.requirejs));