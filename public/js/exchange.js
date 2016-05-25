(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'formVerified', 'handlebars', 'dialog', 'info' ], function ($, Ajax, common, FormVerified, Handlebars, dialog, info) {
        function Exchange() {
            
            this.init();
        }

        Exchange.COUPONNAME = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        Exchange.COUPONCLASS = {
            "0": "",
            "1": "coupon-blue",
            "2": "coupon-orange",
            "3": "coupon-green"
        };

        Exchange.prototype = {
            init: function () {
                var that = this,
                    vt = new FormVerified(document.forms.exchangeForm, function () {
                        that.activeCoupon();
                    });
                $('#ef-submit').on('click', function () {
                    if (common.userInfo.isLogin === "0") {
                        dialog.show({
                            content: "登录后才能兑换卡券",
                            buttons: [{
                                    name: "立即登录",
                                    callBack: function () {
                                        dialog.close();
                                        window.location.href = "/app/login.html";
                                    }
                                },{
                                    name: "暂不兑换",
                                    callBack: function () {
                                        dialog.close();
                                    }
                                }]
                        });
                    }
                });
                this.registerHHelper();
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

                Handlebars.registerHelper('toJSON', function (value) {
                    return $.toJSON(value);
                });
            },

            activeCoupon: function () {
                var that = this,
                    form = document.forms.exchangeForm,
                    params = {
                        activateCode: form.activateCode.value
                    },
                    request = null;
                if (common.userInfo.isLogin === "0") {
                    return;
                }
                request = new Ajax('/user/activeMyCouponCard.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.packageCouponBox(data.re);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            packageCouponBox: function (data) {
                var that = this,
                    couponName = "",
                    i = 0,
                    length = 0,
                    item = null,
                    html = "",
                    source = $('#getcoupon_template').html(),
                    template = Handlebars.compile(source);
                data.resultSubType = data.resultList[0].resultSubType;
                data.discount = data.resultList[0].discount;
                data.couponClass = Exchange.COUPONCLASS[data.resultSubType];
                data.couponType = Exchange.COUPONNAME[data.resultSubType];
                if (data.type === 10) {
                    couponName += "全站通用";
                } else if (data.type === 20) {
                    if (data.servicers.length > 1) {
                        data.moreSize = data.servicers.length - 6;
                        couponName += "限定店铺";
                    } else if (data.servicers.length === 1) {
                        couponName += data.servicers[0];
                    }
                }
                if (data.implement === '10') {
                    couponName += "优惠卡";
                } else if (data.implement === '20') {
                    couponName += "优惠券";
                }
                data.couponName = couponName;
                html = template(data);
                
                info.show({
                    content: html
                });

                $('#efcb-btn').on('click', function () {
                    info.close();
                });

                $('#ef-showAllSp').on('click', function () {
                    info.close();
                    that.showAllSp(this);
                });
            },

            showAllSp: function (obj) {
                var that = this,
                    data = {
                        couponType: $(obj).attr('data-cptype'),
                        tips: $(obj).attr('data-tips'),
                        spList: $.parseJSON($(obj).attr('data-list'))
                    },
                    source = $('#coupon_sp_list').html(),
                    template = Handlebars.compile(source),
                    html = template(data);
                info.show({
                    content: html
                });
                $('#coupon-close').on('click', function () {
                    info.close();
                });
            }
        };
        
        var exchange = new Exchange();
    });
    
}(window.requirejs));