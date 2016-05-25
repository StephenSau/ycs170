/**
 * Created by Administrator on 2015/12/25 0025.
 */
/**
 * Created by Administrator on 2015/12/23 0023.
 */
(function($){
    'use strict';
    var Carousel = function(element,options){
        this.options = $.extend({},Carousel.DEFAULTS,options);
        this.$element = $(element);
        this.oCarousel = this.$element.find(".carousel-inner");
        this.$item = this.oCarousel.children("li");
        this.width = this.$item.eq(0).outerWidth(true);
        this.height = this.$item.eq(0).outerHeight(true);
        this.$active = $(element).find(".carousel-inner li.active");
        this.oTimer =null;
        this.init();
    };

    Carousel.DEFAULTS = {
        interval : 5000,
        autoplay : true,
        events : "click",
        direction : "left"
    };
    Carousel.prototype = {
        init : function(){
            this.create();
            this.listener();
        },
        listener : function(){
            var that =this;
            this.$element.on("click",".prev",$.proxy(this.prev,this));
            this.$element.on("click",".next",$.proxy(this.next,this));
            if(this.options.autoplay){
                this.$element.on({
                    "mouseenter":function(){
                        clearInterval(that.oTimer);
                    },
                    "mouseleave":$.proxy(this.cycle,this)
                })
            };
            this.$element.on(this.options.events,"ol li" ,function(){
                that.navChange(this);
            });
        },
        create : function(){
            if(this.$item.length ==1){
                return;
            }
            if(this.options.autoplay){
                this.cycle();
            }
        },
        cycle : function(){
            var that = this;
            this.oTimer = setInterval(function(){
                that.next();
            },this.options.interval);
        },
        next: function () {
            return this.move('next');
        },

        navChange : function(This){
            this.index = $(This).index();
            this.move();
        },
        getItemIndex: function (item) {
            this.$items = item.parent().children('.item');
            return this.$items.index(item || this.$active);
        },
        getItemForDirection: function (direction, active) {//nex,li
            var delta = direction === "prev" ? -1 : 1,
                activeIndex = this.getItemIndex(active),

                itemIndex = (activeIndex + delta) % this.$items.length;
            return this.$items.eq(itemIndex);
        },

        move:function(type,next){
            var $next = next || this.getItemForDirection(type, this.$active),
                that = this,
                runAnimate = {},
                runCss = {},
                runMargin = {},
                delta = type === "prev" ? -1 : 1;//delta = 1;
            if(this.options.direction =='left'){
                runAnimate = {'margin-left':-delta * this.width};
                runCss ={
                    'left': delta * this.width,
                    top:0
                };
                runMargin ={
                    left:0
                }
            }else if(this.options.direction =='up'){
                runAnimate = {'margin-top':-delta * this.height};
                runCss ={
                    'left': 0,
                    top:delta * this.height
                };
                runMargin ={
                    top:0
                }
            }
            this.$active.stop(false,true).animate(runAnimate,400,function(){
                $(this).removeClass('active').removeAttr("style");
            });

            $next.css(runCss).animate(runMargin, 400, function () {
                that.$active = $next;
                $next.addClass('active').removeAttr('style');
            });

        }
    };

    function Plugin(option){
        return this.each(function(){
            var $this = $(this),
                data = $this.data("bs.carousel"),
                options =  typeof option == "object" && option;
            if(!data){
                $this.data("bs.carousel",(data = new Carousel(this,options)));
            }
            if(typeof option === "String"){
                data[option]();
            }
        })
    }
    var old = $.fn.carousel;
    $.fn.carousel = Plugin;
    $.fn.carousel.constructor=Carousel;

    if($.fn.carousel.noConflict){
        $.fn.carousel=old;
        return this;
    }
    $(window).on("load",function(){
        $('[data-spy="carousel"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });

})(window.jQuery);