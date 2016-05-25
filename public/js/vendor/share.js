(function ($) {
    'use strict';
    
    function Share(element, options) {
        this.options = $.extend({}, Share.DEFAULTS, options);
        this.$element =  $(element);
        this.init();
    }
    
    Share.DEFAULTS = {};
    
    Share.prototype = {
        init: function () {
            var that = this;
            this.listener();    
        },

        listener: function () {
            var that = this;
            this.$element.on('click', function () {
                var btn = $(this),
                    status = btn.attr('data-status');
                if (!status) {
                    that.packageBox();   
                } else if (status === "hide") {
                    btn.children('.wechat-code').show();
                    btn.attr('data-status', 'show');
                } else if (status === "show") {
                    btn.children('.wechat-code').hide();
                    btn.attr('data-status', 'hide');
                }
            });
        },

        packageBox: function () {
            var that = this,
                html = [];
            html.push('<span class="wechat-code">');
            html.push('<img src="http://s.jiathis.com/qrcode.php?url=' + this.$element.attr('data-url') + '" />');
            html.push('<span>打开微信“扫一扫”，打开网页后点击屏幕右上角分享按钮</span>');
            html.push('</span>');
            this.$element.append(html.join('')).attr('data-status', 'show');
        }
    };
    
    
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.share'),
                options = typeof option === "object" && option;

            if (!data) {
                $this.data('bs.share', (data = new Share(this, options)));
            }
            
            if (typeof option === 'string') {
                data[option]();
            }
        });
    }
    
    
    var old = $.fn.share;
    
    $.fn.share = Plugin;
    $.fn.share.Constructor = Share;
    
    
    $.fn.share.noConflict = function () {
        $.fn.share = old;
        return this;
    };
    
    $(window).on('load', function () {
        $('[data-spy="share"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });

}(window.jQuery));