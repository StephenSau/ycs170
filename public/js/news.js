(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'handlebars', 'carousel', 'share', 'affix', 'scrollspy'], function ($, Ajax, common, Handlebars) {
        function News(){
            this.currentPage = 2;
            this.pageSize = 10;
            this.init();
        }

        News.prototype = {
            init: function () {
                var that = this;
                $('#ng-carousel').carousel({
                    needInd: false,
                    autoPlay: false
                });

                $('a[data-spy="share"]').share();

                // $('#news-aside').dragscroll({
                //     scrollBars: true,
                //     smoothness: 15,
                //     mouseWheelVelocity: 20
                // });
                this.listener();
            },

            listener: function () {
                var that = this;
                $('#nb-moreBtn').on('click', function () {
                    that.queryNewsList();
                });

                // sticking nav
                $('#news-tabs').affix({
                    offset: {
                        top: function($target){
                            // `body` for FF and `html` for webkit
                            if (($('html').scrollTop() || $('body').scrollTop()) >= 700){
                               $target.addClass('second-level');
                            } else {
                               $target.removeClass('second-level');
                            }
                            return 560;
                        }
                    }
                });

                var offsetDeltaY = 140;

                $('body').scrollspy({
                    target: '#news-tabs',
                    offset: offsetDeltaY + 10
                });
            },

            queryNewsList: function () {
                var that = this,
                    params = {
                       pageNumber: this.currentPage,
                       pageSize: this.pageSize,
                       columnName: common.getParams('columnName'),
                       columnids: common.getParams('columnids')
                    },
                    request = new Ajax('/article/ajaxGetArticle.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.writeNewsList(data.re);
                        that.currentPage += 1;
                    } else {
                        common.errorDialog(data);
                    }
                });

            },

            registerHHelper: function () {
                Handlebars.registerHelper('compare', function (left, operator, right, options) {
                    if (arguments.length < 3) {
                        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
                    }
                    var operators = {
                        '==': function (l, r) {
                            return l == r;
                        },
                        '===': function (l, r) {
                            return l === r;
                        },
                        '!=': function (l, r) {
                            return l != r;
                        },
                        '!==': function (l, r) {
                            return l !== r;
                        },
                        '<': function (l, r) {
                            return l*1 < r*1;
                        },
                        '>': function (l, r) {
                            return l*1 > r*1;
                        },
                        '<=': function (l, r) {
                            return l*1 <= r*1;
                        },
                        '>=': function (l, r) {
                            return l*1 >= r*1;
                        },
                        'typeof': function (l, r) {
                            return typeof l == r;
                        }
                    };

                    if (!operators[operator]) {
                        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
                    }

                    var result = operators[operator](left, right);

                    if (result) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
                    }
                });
            },

            writeNewsList: function (data) {
                var html = "",
                    box = $('#news-list'),
                    i = 0,
                    item = null,
                    length = data.List.length,
                    source = $('#news_list_template').html(),
                    template = Handlebars.compile(source);
               
                for (i = 0; i < length; i += 1) {
                    item = data.List[i];
                    item.imageFlag = item.image === "" ? false : true;
                    item.newColumnName = decodeURI(item.newColumnName);
                }
                html = template(data);
                $(html).appendTo(box);
                
            }
        };

        var news = new News();
    });
}(window.requirejs));