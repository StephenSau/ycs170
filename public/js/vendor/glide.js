(function($){
    'use strict';
    var Glide = function(element,options){
        this.options = $.extend({}, Glide.DEFAULTS,options);
        this.$element = $(element);
        this.$cabinet = this.$element.find('[data-role="cabinet"]');
        this.$list = this.$element.find('[data-role="list"]');
        this.$prev = this.$element.find('[data-role="prev"]');
        this.$next = this.$element.find('[data-role="next"]');
        this.$items = this.$list.find('[data-role="item"]');
        this.distance = this.$items.outerWidth(true);
        this.$active = this.$items.eq(0);
        this.onMoving = false;
        this.current = 0;
        this.past = -1;
        this.totalLength = this.$items.length;
        this.showLength = 0;
        this.init();
    };

    Glide.DEFAULTS = {
        events : "click",
        callback: null
    };
    Glide.prototype = {
        init : function(){
        	this.rebuildStyle();
            this.listener();
        },

        listener : function(){
            var that =this;
            this.$prev.on('click', function () {
            	if (!that.onMoving) {
            		that.slide(-1);
            	}
            });
            this.$next.on('click', function () {
            	if (!that.onMoving) {
            		that.slide(1);
            	}
            });

            this.$items.on('click', function () {
            	that.current = $(this).index();
            	that.$active = $(this);
            	that.choice();
            });

            this.$element.on('glide:next', function () {
                if (!that.onMoving && that.current < that.totalLength -1) {
                    that.slide(1);
                }
            }).on('glide:prev', function () {
                if (!that.onMoving && that.current !== 0) {
                    that.slide(-1);
                }
            }).on('glide:update', function () {
                that.update();
            });
        },

        update: function () {
            this.$items = this.$list.find('[data-role="item"]');
            this.distance = this.$items.outerWidth(true);
            this.$active = this.$items.eq(0);
            this.onMoving = false;
            this.current = 0;
            this.past = -1;
            this.totalLength = this.$items.length;
            this.rebuildStyle();
        },

        rebuildStyle: function () {
        	var cwidth = this.$cabinet.width();
        	this.$list.css({
        		width: this.distance*this.totalLength
        	});
        	this.showLength = Math.ceil(cwidth/this.distance);
        	if (this.distance*this.totalLength <= this.distance*this.showLength) {
        		this.$prev.hide();
        		this.$next.hide();
        	} else {
        		this.$prev.hide();
        	}
        	this.choice();
        },

        slide: function (direction) {
        	var that = this,
        		hasChange = false;
        	this.past += direction;
        	this.$next.show();
        	this.$prev.show();
        	if (this.past === this.totalLength - this.showLength - 1) {
        		this.$next.hide();
        	} else if (this.past === -1) {
        		this.$prev.hide();
        	}
        	this.onMoving = true;

        	if (this.showLength > 1) {
        		if (this.current === this.past || this.current >= this.past + this.showLength + 1) {
        			this.current += direction;
        			this.$active = this.$items.eq(this.current);
        			hasChange = true;
        		}
        	} else if (this.showLength === 1) {
        		this.current += direction;
        		this.$active = this.$items.eq(this.current);
        		hasChange = true;
        	}
        	this.$list.animate({
				'margin-left': -this.distance*(this.past + 1)
			}, function () {
				that.onMoving = false;
				if (hasChange) {
					that.choice();
				}
			});
        },

        choice: function () {
        	this.$items.removeClass('active');
        	this.$active.addClass('active');
        	if (typeof this.options.callback === 'function') {
        		this.options.callback(this.$active);
        	}
        }
    };

    function Plugin(option){
        return this.each(function(){
            var $this = $(this),
                data = $this.data("bs.glide"),
                options =  typeof option == "object" && option;
            if(!data){
                $this.data("bs.glide",(data = new Glide(this,options)));
            }
            if (typeof option === "string") {
                data[option]();
            }
        });
    }
    var old = $.fn.glide;
    $.fn.glide = Plugin;
    $.fn.glide.constructor=Glide;

    if($.fn.glide.noConflict){
        $.fn.glide=old;
        return this;
    }
    $(window).on("load",function(){
        $('[data-spy="glide"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });

})(window.jQuery);