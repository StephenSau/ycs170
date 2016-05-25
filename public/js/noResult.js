(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'handlebars', 'carousel', 'dragScroll'], function ($, Ajax, common, Handlebars) {
        function NoResult(){
            this.currentPage = 2;
            this.pageSize = 10;
            this.init();
        }

        NoResult.prototype = {
            init: function () {
                var that = this;
                $('#ng-carousel').carousel({
                    needInd: false,
                    autoPlay: false
                });
                $('#hwsb-text').val(decodeURI(common.getParams('querycondition')));
                $('#hwsb-hotSearch').hide();
            }
        };

        var noResult = new NoResult();
    });
}(window.requirejs));