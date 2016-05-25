(function ($) {
    "use strict";

    function Carousel(element, options) {
        this.$element = $(element);
        this.$items = $(element).find('li');
        if (element.getElementsByTagName('img')[0]) {
            this.width = element.getElementsByTagName('img')[0].getAttribute('width');
            this.height = element.getElementsByTagName('img')[0].getAttribute('height');
        } else {
            this.width = this.$items.width();
            this.height = this.$items.height();
        }
        this.options = $.extend({}, Carousel.DEFAULTS, options);
        this.inner = $(element).find('.carousel-inner');
        
        if (this.$items.length === 1) {
            return;
        }
        this.$active = $(element).find('.carousel-inner li.active');
        if (this.options.needInd) {
            this.$indicators = this.buildIndicators();
        }
        this.$images = $(element).find('img');
        this.paused = null;
        this.sliding = null;
        this.interval = null;
        var that = this;
        if (!this.$active.length) {
            this.$active = $(this.$items[0]);
            this.$active.addClass('active');
        }

        this.$element.css({
            width: this.width + 'px',
            height: this.height + 'px'
        });

        if (this.options.changeStyle === "move") {
            this.inner.addClass('carousel-move');
        } else if (this.options.changeStyle === "gradual") {
            this.inner.addClass('carousel-gradual');
            this.inner.css({
                width: this.width + "px",
                height: this.height + "px"
            });
        }

        if (this.options.lazyLoad & element.getElementsByTagName('img')[0]) {
            this.loadImage();
        } else {
            that.run();
        }


        if (this.options.pause === 'hover') {
            this.$element
                .on('mouseenter', $.proxy(this.pause, this))
                .on('mouseleave', $.proxy(this.cycle, this));
        }

        if (this.options.needInd) {
            this.$indicators.delegate('.carousel-btn', 'click', function () {
                var pos = parseInt(this.getAttribute('data-slide-to'), 10),
                    active = that.$items.index(that.$active);
                if (pos !== active) {
                    that.slide((pos > active ? "next" : "prev"), that.$items.eq(pos));
                }

            }); 
        }
        

    }

    Carousel.DEFAULTS = {
        interval: 5000,
        needInd: true,
        pause: 'hover',
        wrap: true,
        autoPlay: true,
        needIndex: false,
        lazyLoad: true,
        changeStyle: "move"
    };

    Carousel.prototype = {
        run: function () {
            if (this.options.autoPlay) {
                this.interval = setInterval($.proxy(this.next, this), this.options.interval);
            }

        },

        loadImage: function () {
            var i = 0,
                that = this,
                length = this.$images.length;

            function load(images) {
                images[i].src = images[i].getAttribute('data-src');

                images[i].onload = function () {

                    i = i + 1;
                    if (i < length) {
                        load(images);
                    } else {
                        that.run();
                    }
                };

            }

            if (navigator.userAgent.indexOf('MSIE 7.0') !== -1 || navigator.userAgent.indexOf('MSIE 8.0') !== -1) {
                for (i = 0; i < length; i += 1) {
                    this.$images[i].src = this.$images[i].getAttribute('data-src');
                }
                setTimeout(function () {
                    that.run();
                }, 1000);

            } else {
                load(this.$images);
            }


        },

        next: function () {
            if (this.sliding) {
                return;
            }

            return this.slide('next');
        },

        pause: function (flag) {
            if (!flag) {
                this.paused = true;
            }

            this.interval = clearInterval(this.interval);

            return this;
        },

        cycle: function (flag) {
            var that = this;
            if (!flag) {
                this.paused = false;
            }

            if (this.interval) {
                clearInterval(this.interval);
            }

            if (this.options.interval && !this.paused) {
                this.interval = setInterval($.proxy(this.next, this), this.options.interval);
            }

            return this;
        },

        buildIndicators: function () {
            var html = [],
                i = 0,
                isIE7 = /MSIE 7\.\d+/.test(navigator.userAgent) === true ? true : false,
                length = this.$items.length,
                temp = null;

            html.push('<' + (isIE7 ? 'p' : 'ol') + ' class="carousel-indicators">');

            for (i = 0; i < length; i = i + 1) {
                html.push('<' + (isIE7 ? 'span' : 'li') + ' class="carousel-btn' + (i === 0 ? ' active' : '') + '" data-slide-to="' + i + '" data-target="#' + this.$element[0].id + '">' + (this.options.needIndex ? (i + 1) : '') + '</' + (isIE7 ? 'span' : 'li') + '>');
            }

            html.push('</' + (isIE7 ? 'p' : 'ol') + '>');

            return $(html.join('')).prependTo(this.$element);
        },

        getItemIndex: function (item) {
            this.$items = item.parent().children('.item');
            return this.$items.index(item || this.$active);
        },

        getItemForDirection: function (direction, active) {
            var delta = direction === "prev" ? -1 : 1,
                activeIndex = this.getItemIndex(active),
                itemIndex = (activeIndex + delta) % this.$items.length,
                willWrap = (direction === 'prev' && activeIndex === 0) || (direction === 'next' && activeIndex === (this.$items.length - 1));
            if (willWrap && !this.options.wrap) {
                return active;
            }

            return this.$items.eq(itemIndex);
        },

        slide: function (type, next) {
            var $next = next || this.getItemForDirection(type, this.$active),
                that = this,
                isCycling = this.interval,
                $nextIndicator = null,
                delta = type === "prev" ? -1 : 1;
            
            this.sliding = true;
            if (isCycling) {
                this.pause();
            }

            if (this.options.needInd && this.$indicators.length) {
                this.$indicators.find('.active').removeClass('active');
                $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)]);
                if ($nextIndicator) {
                    $nextIndicator.addClass('active');
                }
            }
            if (this.options.changeStyle === "move"){
                this.$active.animate({
                    'margin-left': -delta * this.width + 'px'
                }, 400, function () {
                    $(this).removeClass('active').removeAttr('style');
                });

                $next.css({
                    'left': delta * this.width + 'px',
                    'top': '0'
                }).animate({
                    'left': 0
                }, 400, function () {
                    that.$active = $next;
                    $next.addClass('active').removeAttr('style');
                    that.sliding = false;
                    if (that.options.callback && typeof that.options.callback === 'function'){
                        that.options.callback(that.$active);
                    }
                    if (isCycling) {
                        that.cycle();
                    }
                });
            } else if (this.options.changeStyle === "gradual") {
                this.$active.removeClass('active');
                this.$active.css({
                    'z-index': 0,
                    'opacity': 1,
                });
                $next.css({
                    'z-index': 1,
                    'opacity': 0,
                }).animate({
                    'opacity': 1,
                }, 400, function () {
                    that.$active.removeAttr('style');
                    $next.addClass('active').removeAttr('style');
                    that.$active = $next;
                    that.sliding = false;
                    if (that.options.callback && typeof that.options.callback === 'function'){
                        that.options.callback(that.$active);
                    }
                    if (isCycling) {
                        that.cycle();
                    }
                });
            }
            
        }
    };


    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.carousel'),
                options = typeof option === "object" && option;

            if (!data) {
                $this.data('bs.carousel', (data = new Carousel(this, options)));
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    }


    var old = $.fn.carousel;

    $.fn.carousel = Plugin;
    $.fn.carousel.Constructor = Carousel;


    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old;
        return this;
    };

    $(window).on('load', function () {
        $('[data-spy="carousel"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });
}(window.jQuery));
