(function ($) {
    'use strict';
    
    function Choice(element, options) {
        this.$element = $(element);
        this.label = this.$element.next('label');
        this.options = $.extend({}, Choice.DEFAULTS, options);
        this.init();
    }
    
    Choice.DEFAULTS = {
        
    };
    
    Choice.prototype = {
        init: function () {
            var that = this;
            this.packChoice();
            this.$element.unbind('change', this.choiceChagne).on('change', this.choiceChagne);
            this.$element.on("choice:update", function(){
                that.choiceChagne.call(this, null); 
            });
            this.$element.on("choice:rebind", function () {
                $(this).unbind('change', this.choiceChagne).on('change', this.choiceChagne);
            });
        },

        choiceChagne: function () {
            var label = $(this).next('label'),
                name = this.getAttribute('name'),
                type = this.getAttribute('type').toLocaleLowerCase();

            if(this.getAttribute('type') === "checkbox" && typeof arguments[0] === "boolean"){
                this.checked = arguments[0];
                if (arguments[0]) {
                    label.addClass('active');
                } else {
                    this.label.removeClass('active');
                }
            }

            if (this.checked) {
                label.addClass('active');
            } else {
                label.removeClass('active');
            }

            if(this.disabled){
                this.label.addClass("disabled");
            }
            if(name && typeof arguments[0] === "object" && type === "radio"){
                var groups = document.getElementsByName(name);
                for(var i = 0, length = groups.length; i < length; i++){
                    Choice.prototype.choiceChagne.call(groups[i], "rebuild");
                }
            }
        },

        packChoice: function () {
            var choice = this.$element[0];
            this.$element.addClass('choice-input');
            if (choice.type === 'checkbox') {
                this.label.addClass('choice-checkbox');
            } else if (choice.type === 'radio') {
                this.label.addClass('choice-radio');
            }
            if (choice.checked === true) {
                this.label.addClass('active');
            }
        }
    };
    
    
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.choice'),
                options = typeof option === "object" && option;
            
            if (!data) {
                $this.data('bs.choice', (data = new Choice(this, options)));
            }
            
            if (typeof option === 'string') {
                data[option]();
            }
        });
    }
    
    
    var old = $.fn.choice;
    
    $.fn.choice = Plugin;
    $.fn.choice.Constructor = Choice;
    
    
    $.fn.choice.noConflict = function () {
        $.fn.choice = old;
        return this;
    };
    
    $(window).on('load', function () {
        $('[data-spy="choice"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });
}(window.jQuery));