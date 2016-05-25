(function ($) {
    'use strict';
    
    function Tab(element, options) {
        this.flag = null;
        this.index = 0;
        this.initActive = $(element).find('.active');
        this.tabs = $(element).find('[data-role="item"]');
        this.tabContents = this.findBox();
        this.options = $.extend({}, Tab.DEFAULTS, options);
        this.$element =  $(element);
        this.init();
    }
    
    Tab.DEFAULTS = {
        ant: false,
        autoPlay: false,
        interval: 5000,
        listener: 'click'
    };
    
    Tab.prototype = {
        init: function () {
            var that = this,
                i = 0,
                length = this.tabContents.length,
                flag = null,
                cycle = function () {
                    flag = setInterval(function () {
                        that.changeTab($(that.tabs[(that.index + 1) % that.tabs.length]));
                    }, that.options.interval);
                };

            this.changeTab(this.options.active || this.initActive || this.tabs.eq(0));
            this.$element.on(this.options.listener, '[data-role="item"]',  function () {
                that.changeTab($(this));
            }).on('click', '[data-role="next"]', function () {
                that.index = that.tabs.index(that.tabs.filter(".active")) !=-1 ? that.tabs.index(that.tabs.filter(".active")) : that.index;
                var no = that.index + 1 >= that.tabs.length ? (that.tabs.length - 1) : (that.index+ 1);
                that.changeTab($(that.tabs[no]));
            }).on('click', '[data-role="previous"]', function () {
                that.index = that.tabs.index(that.tabs.filter(".active")) !=-1 ? that.tabs.index(that.tabs.filter(".active")) : that.index;
                var no = that.index - 1 < 0 ? 0 : (that.index - 1);
                that.changeTab($(that.tabs[no]));
            });
            if (this.options.autoPlay) {
                cycle();
                this.$element.on('mouseenter', function () {
                    clearInterval(flag);
                }).on('mouseleave', function () {
                    cycle();
                });
                for (i = 0; i < length; i += 1) {
                    this.tabContents[i].on('mouseenter', function () {
                        clearInterval(flag);
                    }).on('mouseleave', function () {
                        cycle();
                    });
                }
            }
        },
        
        findBox: function () {
            var boxs = [],
                targets = "",
                taraget = "",
                i = 0,
                length = 0;
            this.tabs.each(function (index) {
                targets = $.trim(this.getAttribute('data-target')).split(/\s+/);
                for (i = 0, length = targets.length; i < length; i += 1) {
                    taraget = targets[i];
                    if (document.getElementById(taraget)) {
                        boxs.push($('#' + taraget));
                    }
                }
            });
            return boxs;
        },
        
        changeTab: function ($active) {
            var i = 0,
                length = this.tabContents.length,
                item = null,
                $prevContent = null,
                $activeContent = null,
                target = $active.attr('data-target');
            this.tabs.removeClass('active');
            this.index = this.tabs.index($active);
            if (this.options.prev) {
                this.tabs.removeClass('prev');
                $active.prev().addClass('prev');
            }
            $active.addClass('active');
            
            if (length) {
                if (this.options.ant) {
                    for (i = 0; i < length; i += 1) {
                        item = this.tabContents[i];
                        if (this.isInTarget(target, item.attr('id'))) {
                            $activeContent = item;
                        } else if (item.hasClass('active')) {
                            $prevContent = item;
                        }
                    }
                    
                    if ($prevContent) {
                        $prevContent.fadeOut(400, function () {
                            $prevContent
                                .removeClass('active')
                                .removeAttr('style');
                            $activeContent.addClass('active');
                        });
                    } else {
                        $activeContent.addClass('active');
                    }
                } else {
                    for (i = 0; i < length; i +=1) {
                        item = this.tabContents[i];
                        if (this.isInTarget(target, item.attr('id'))) {
                            item.addClass('active');
                        } else {
                            item.removeClass('active');
                        }
                    }
                } 
            }

            if (this.options.callback) {
                this.options.callback($active);
                return;
            }
        },

        isInTarget: function (target, source) {
            if (/\s+/.test(target)) {
                var reg = new RegExp('(' + $.trim(target).replace(/\s+/ig, '|') + ')');
                if (reg.test(source)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                if (target === source) {
                    return true;
                } else {
                    return false;
                }
            }
            
        }
    };
    
    
    function Plugin(option) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('bs.tab'),
                options = typeof option === "object" && option;

            if (!data) {
                $this.data('bs.tab', (data = new Tab(this, options)));
            }
            
            if (typeof option === 'string') {
                data[option]();
            }
        });
    }
    
    
    var old = $.fn.tab;
    
    $.fn.tab = Plugin;
    $.fn.tab.Constructor = Tab;
    
    
    $.fn.tab.noConflict = function () {
        $.fn.tab = old;
        return this;
    };
    
    $(window).on('load', function () {
        $('[data-spy="tab"]').each(function () {
            var $spy = $(this),
                data = $spy.data();
            Plugin.call($spy, data);
        });
    });

}(window.jQuery));