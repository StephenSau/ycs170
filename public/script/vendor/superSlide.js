/**
 * Created by Administrator on 2015/12/16 0016.
 */
/*
 *superSlide 多图无缝滚动
 *@param
 * showCount :显示个数
 * iWidth : 子元素的宽度
 * */
! function($) {
    var SuperSlide = function(element, options) {
        var that = this;
        this.options = $.extend({}, SuperSlide.DEFAULTS, options);
        this.$element = $(element); /*锁定目标元素*/
        this.oCarousel = $(element).find("ul").eq(0); /*切换元素*/
        this.aChildren = this.oCarousel.children("li");
        this.iWidth = this.oCarousel.find(this.options.iWidth).eq(1).outerWidth(true); /*子元素的宽度*/
        this.info = $(element).find(".set-pannel-info");
        this.oPrev = $(element).find(".prev"); /*上一步的切换*/
        this.oNext = $(element).find(".next"); /*下一步的切换*/
        this.showCount = this.options.showCount; /*显示个数的切换*/
        this.flag = true;
        this.iNow = 0;
        this.iLen = 0;

        if (this.aChildren.length <= this.showCount - 1) {
            this.oPrev.hide();
            this.oNext.hide();
            if (this.options.dialogCar) {
                if (this.aChildren.length == 1) {
                    this.oCarousel.css({
                        left: 139
                    })
                }
            } else {
                this.oCarousel.width(this.getWidth(this.aChildren)).css({
                    position: "static",
                    margin: "0 auto"
                });
            }
            return;
        }

        this.oCarousel.append(this.oCarousel.html());
        this.aChildren = this.oCarousel.children("li");
        if (this.options.sublist) {
            this.info.append(this.info.html()).children("dl").removeClass("active")
                .eq(0).addClass("active");
        }
        /*生成元素后的长度*/
        this.iLen = this.aChildren.length;
        /*设置宽度*/
        this.oCarousel.width(this.getWidth(this.aChildren));
        this.init();

    };

    SuperSlide.DEFAULTS = {
        showCount: 5,
        showArrow: true,
        iWidth: "li"
    };

    SuperSlide.prototype = {
        init: function() {
            var that = this;
            /*优惠套餐*/
            this.listener();
        },
        listener: function() {
            var that = this;
            /*上一页切换*/
            this.$element.on("click", ".prev", function() {
                that.prev();

            });
            /*下一页切换*/
            this.$element.on("click", ".next", function() {
                that.next();
                return false;
            });
            /*是否显示切换箭头*/
            if (this.options.showArrow) {
                if (this.aChildren.length / 2 >= this.showCount) {
                    this.$element.on("mouseenter", $.proxy(this.showArrow, this))
                        .on("mouseleave", $.proxy(this.hideArrow, this));
                }
            }
        },
        getWidth: function(obj) {
            var totalWidth = 0;
            $.each(obj, function() {
                totalWidth += parseInt($(this).outerWidth(true));

            });

            return totalWidth;
        },

        showArrow: function() {
            this.$element.find(".prev").show();
            this.$element.find(".next").show();
        },
        hideArrow: function() {
            this.$element.find(".prev").hide();
            this.$element.find(".next").hide();
        },
        prev: function() {
            this.iNow--;
            this.slide();
        },
        next: function() {
            this.iNow++;
            this.slide();

        },
        slide: function() {

            var that = this;
            if (this.iNow < 0) {
                this.$element.find("ul").css("left", -this.iLen / 2 * this.iWidth);
                this.iNow = this.iLen / 2 - 1;
            }
            if (this.iNow > this.iLen / 2) {
                this.$element.find("ul").css("left", 0);
                this.iNow = 1;
            };
            this.options.callback && this.callback();

            this.$element.find("ul").stop().animate({
                left: -that.iNow * that.iWidth
            })
        },
        callback: function() {
            var that = this;
            $('#ui-info-content .set-pannel>li').removeClass('active')
                .eq(that.iNow).addClass("active");
        },

    };

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this),
                data = $this.data('bs.superSlide'),
                options = typeof option === "object" && option;

            if (!data) {
                $this.data('bs.superSlide', (data = new SuperSlide(this, options)));
            }

            if (typeof option === 'string') {
                data[option]();
            }
        });
    }


    var old = $.fn.superSlide;

    $.fn.superSlide = Plugin;
    $.fn.superSlide.Constructor = SuperSlide;


    $.fn.superSlide.noConflict = function() {
        $.fn.superSlide = old;
        return this;
    };

    $(window).on('load', function() {
        $('[data-spy="superSlide"]').each(function() {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });
}(window.jQuery);
