(function ($) {
    'use strict';
    
    function Chosen(element, options) {
        this.$element = $(element);
        this.options = $.extend({}, Chosen.DEFAULTS, options);
        this.$text = null;
        this.$facade = null;
        this.packSelect();
        this.addAction();
    }
    
    Chosen.DEFAULTS = {
        
    };
    
    Chosen.prototype = {
        addAction: function () {
            var that = this;
            this.$element
                .on('change', $.proxy(this.selectChange, this))
                .on('focus', function () {
                    that.$facade.addClass('chosen_on_foucs');
                })
                .on('blur', function () {
                    that.$facade.removeClass('chosen_on_foucs');
                })
                .on('chosen:update', $.proxy(this.selectChange, this))
                .on('chosen:change', $.proxy(this.changeStatus, this));
            this.selectChange();
        },
        
        changeStatus: function () {
            if (this.$element.hasClass('valid')) {
                this.$facade.removeClass('invalid').addClass('valid');
            } else if (this.$element.hasClass('invalid')) {
                this.$facade.removeClass('valid').addClass('invalid');
            }
        },
        
        selectChange: function () {
            var i = 0,
                length = 0,
                content,
                $this = this.$element[0],
                value = $this.value || $this.getAttribute("value");

            if (this.options.length !== 0) {
                this.$text.text($this.options[$this.selectedIndex].text);
                if (value) {
                    for (i = 0, length = $this.options.length; i < length; i = i + 1) {
                        if ($this.options[i].value === value) {
                            this.$text.text($this.options[i].text);
                            $this.options[i].setAttribute("selected", "true");
                        }
                    }
                }
            }
        },
        
        packSelect: function () {
            var width = this.$element.width(),
                target = this.$element.attr("id") + "_text",
                html = [],
                className = this.$element[0].className,
                $outer = this.$element.wrap('<span class="chosen' + (className ? (' ' + className) : '') + '"></span>').parent();
            this.$element.attr('data-target', target);
            this.$facade = $('<span class="chosen_facade" style="width:' + (width - 10 - 25) + 'px"></span>');
            this.$text = $('<em class="chosen_selected_text" id="' + target + '">请选择</em>');
            this.$facade.append(this.$text).append('<i class="chosen_arrow_icon"></i>');
            $(this.$facade).prependTo($outer);
            this.$text = $outer.find('.chosen_selected_text');
            this.$element.addClass('chosn_options');
        }
    };
    
    
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.chosen'),
                options = typeof option === "object" && option;
            
            if (!data) {
                $this.data('bs.chosen', (data = new Chosen(this, options)));
            }
            
            if (typeof option === 'string') {
                data[option]();
            }
        });
    }
    
    
    var old = $.fn.chosen;
    
    $.fn.chosen = Plugin;
    $.fn.chosen.Constructor = Chosen;
    
    
    $.fn.chosen.noConflict = function () {
        $.fn.chosen = old;
        return this;
    };
    
    $(window).on('load', function () {
        $('[data-spy="chosen"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });
}(window.jQuery));