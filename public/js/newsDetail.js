(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'share'], function ($, Ajax, common) {
        function NewsDetail(){
            this.init();
        }

        NewsDetail.prototype = {
            init: function () {
                var that = this;
                $('a[data-spy="share"]').share();
                this.listener();
            },

            listener: function () {
                var that = this;
                $('#nc-like').on('click', function () {
                    if ($(this).hasClass('nc-disabled')) {
                        return;
                    }
                    that.likeit(this);
                });
            },

            likeit: function (obj) {
                var that = this,
                    id = window.location.href.match(/(\d+)(.html)$/)[1],
                    params = {
                       id: id
                    },
                    request = new Ajax('/article/clickLike.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(obj).html(data.re.likes).addClass('nc-disabled');
                        $('#nc-good').html(data.re.likes);
                    } else {
                        common.errorDialog(data);
                    }
                });
            }
            
        };

        var newsDetail = new NewsDetail();
    });
}(window.requirejs));