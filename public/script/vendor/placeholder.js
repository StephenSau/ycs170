(function ($) {
    'use strict';
    
    function Placeholder(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Placeholder.DEFAULTS, options);
        this.packageHolder();
       
    }
    
    Placeholder.DEFAULTS = {
        
    };
    
    Placeholder.prototype = {
        isSupported: function () {
            return 'placeholder' in document.createElement('input');
        },
        
        packageHolder: function () {
            var that = this,
                text = this.$element.attr('placeholder'),
                pdl = 0,
				height = this.$element.outerHeight(),
				width = this.$element.outerWidth(),
				holder = $('<span>' + text + '</span>');
            if (!this.isSupported()) {
                try {
                    pdl = parseInt(this.$element.css('padding-left'), 10);
                } catch (e) {
                    pdl = 5;
                }
                holder.css({
                    'margin-left': -(width - pdl),
                    'height': height,
                    'line-height': height + "px",
                    'position': 'absolute',
                    'color': "#9e9e9e",
                    'font-size' : "12px"
                });
                
                holder.click(function () {
                    that.$element.focus();
                });
                
                if (this.$element.val() !== "") {
                    holder.css({display: 'none'});
                } else {
                    holder.css({display: 'inline'});
                }
                
                holder.insertAfter(this.$element);
                
                this.$element.keyup(function (e) {
                    if ($(this).val() !== "") {
                        holder.css({display: 'none'});
                    } else {
                        holder.css({display: 'inline'});
                    }
                });
            }
        }
    };
    
    
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.placeholder'),
                options = typeof option === "object" && option;
            
            if (!data) {
                $this.data('bs.placeholder', (data = new Placeholder(this, options)));
            }
            
            if (typeof option === 'string') {
                data[option]();
            }
        });
    }
    
    
    var old = $.fn.placeholder;
    
    $.fn.placeholder = Plugin;
    $.fn.placeholder.Constructor = Placeholder;
    
    
    $.fn.placeholder.noConflict = function () {
        $.fn.placeholder = old;
        return this;
    };
    
    $(window).on('load', function () {
        $('[data-spy="placeholder"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });
}(window.jQuery));