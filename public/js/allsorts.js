(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'affix', 'scrollspy', 'handlebars', 'dialog', 'dial', 'info','addressBox'], function ($, Ajax, common, affix, scrollspy, Handlebars, dialog, dial, info,addressBox) {
        function allSorts () {
            this.init();
            this.info = info;
            this.$detailInfo = $("#coupon-info .coupon-popover");
            this.location = window.location.pathname;
        }

        allSorts.ZINDEX = 900;

        allSorts.COUPONNAME = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        allSorts.COUPONCLASS = {
            "0": "",
            "1": "coupon-blue",
            "2": "coupon-orange",
            "3": "coupon-green"
        };

        allSorts.prototype = {
            init: function () {
                this.registerHHelper();
                this.listener();
                // this.queryCouponList();
            },

            listener: function () {
                var that = this;

                /*购买选择区域*/
                $("#top-showAddress").on("click", function() {
                        var $this = $(this);
                        addressBox.show(this, function() {
                            that.setCityCode();
                        });
                    });


                // sticking nav
                $('#affixNav').affix({
                    offset: {
                        top: function($target){
                            // `body` for FF and `html` for webkit
                            if (($('html').scrollTop() || $('body').scrollTop()) >= 700){
                               $target.addClass('second-level');
                            } else {
                               $target.removeClass('second-level');
                            }
                            return 180;
                        }
                    }
                });

                var offsetDeltaY = 140;

                $('body').scrollspy({
                    target: '#affixNav',
                    offset: offsetDeltaY + 10
                });

                // Smooth Scroll
                $('.allsorts-tabs li').click(function(e){
                    e.preventDefault();
                    var $scrollTo =  '' + $('a', this).attr('href');
                    var y = $($scrollTo).offset().top - offsetDeltaY;
                    $('html:not(:animated),body:not(:animated)').animate({ scrollTop:y}, 500);
                });

                $('.coupon-list').on('click', 'a[data-role="getCoupon"]', function () {
                    that.getCoupon(this);
                });

                $('.coupon-list').on('click', 'a[data-role="showAllSp"]', function (evt) {
                    var $target = $(evt.target);

                    that.updateSpList($target.data('cptype'), $target.data('tips'), $target.data('list'));

                    that.info.show({
                        content: that.$detailInfo
                    });
                });

                $(document).on("click", ".close-dialog", function() {
                    that.info.close();
                });
            },
            setCityCode: function (params) {
                var that = this,
                    values = $('#top-showAddress').attr('data-value').split(','),
                    params = {
                        province: values[0],
                        city: values[1],
                    },
                    url = "",

                    request = new Ajax("/common/setCitycode.htm", params);

                    request.done(function (data) {
                        if (data.status === "200") {
                             that.setCookie({'provinceName': data.re.provinceCN});
                            that.setCookie({'cityName': data.re.cityCN});
                            that.setCookie({'provinceCode': data.re.province});
                            that.setCookie({'cityCode': data.re.city});
                            // window.location.reload();
                             url = "?province="+data.re.province+"&city="+data.re.city+"&district=";
                            
                            window.location.href=that.location+url;
                        }
                    });
            },
             setCookie: function (params) {
                var key = "";
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        $.cookie(key, params[key], { expires: 7, path: '/'});
                    }
                }
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

            showLoginDialog: function (msg){
                dialog.show({
                    content: msg || '请先登录',
                    buttons: [
                        {
                            name: '马上登录',
                            callBack: function(){
                                window.location.href = '/app/login.html';
                            }
                        },
                        {
                            name: '取消',
                            callBack: function(){
                                // return;
                                dialog.close();
                            }
                        }
                    ]
                });
            },

            getCoupon: function (obj) {
                var that = this;

                // Check if is logged in
                common.getUserInfo(function(data){
                    // Not logged in
                    if (Number(data.isLogin) === 0){
                        that.showLoginDialog();

                    // Logged in
                    } else {
                        var params = {
                           couponsIds: $(obj).attr('data-value') 
                        },
                        request = new Ajax('/user/fetchCouponsIds.htm', params);
                        request.done(function (data) {
                            if (data.status === '200') {
                                dialog.show({
                                    content: '领取成功'
                                });
                                // that.queryCouponList();
                                window.location.reload();

                            } else {
                                // 1034: 会话已失效
                                if (data && Number(data.errorcode) === 1034)
                                    that.showLoginDialog(data.errormsg);
                                else {
                                    common.errorDialog(data);
                                }
                            }
                        });
                    }
                });

            },

            writeCouponList: function (data) {
                var that = this,
                    list = $('#qf-couponList'),
                    html = "",
                    couponName = "",
                    i = 0,
                    length = 0,
                    items = [],
                    item = null,
                    source = $('#findcoupon_template').html(),
                    template = Handlebars.compile(source),
                    addParams = function () {
                        couponName = "";
                        item.zIndex = allSorts.ZINDEX;
                        allSorts.ZINDEX -= 1;

                        if (item.type === 10) {
                            couponName += "网站通用";
                        } else if (item.type === 20) {
                            if (item.servicerSize !== 1) {
                                couponName += "限定店铺";
                            } else if (item.servicerSize === 1) {
                                couponName += item.servicerList[0].nickname;
                                item.servicerId = item.servicerList[0].srid;
                            }
                        }

                        if (item.implement === 10) {
                            couponName += "优惠卡";
                        } else if (item.implement === 20) {
                            couponName += "优惠券";
                        } else {
                            couponName += "赠券";
                        }
                        item.couponName = couponName;
                        if (item.couponType === "折扣") {
                            item.couponClass = "coupon-orange";
                        } else if (item.couponType === "直减") {
                            item.couponClass = "coupon-blue";
                        } else if (item.couponType === "一口价") {
                            item.couponClass = "coupon-green";
                        }

                        item.spList = $.toJSON(item.servicerList);
                    };

                for (i = 0, length = data.list.length; i < length; i += 1) {
                    item = data.list[i];
                    addParams();
                }

                html = template(data);
                list.empty().append(html);
            },

            queryCouponList: function () {
                var that = this,
                    list = $('#qf-couponList'),
                    request = new Ajax('/user/findOutCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.list.length) {
                            that.writeCouponList(data.re);
                        } else {
                            var $noCoupon = $('<div class="no-coupon">暂时没有可以领取的卡券</div>')
                            list.empty().append($noCoupon);
                        }
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            updateSpList: function(couponType, tips, spList){
                var that = this,
                    data = {
                        couponType: couponType,
                        tips: tips,
                        spList: spList
                    },
                    container = $('#spListWrapper'),
                    html = "",
                    source = $('#coupon_sp_list').html(),
                    template = Handlebars.compile(source);
                html = template(data);
                container.empty().append(html);
            }

        };

        var allsorts = new allSorts();

    });
}(window.requirejs));