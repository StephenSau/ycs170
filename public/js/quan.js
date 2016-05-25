(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', "formVerified", 'tab'], function ($, Ajax, common, dialog, info, Handlebars, FormVerified) {
        function Quan () {
            this.init();
        }

        Quan.ZINDEX = 1000;

        Quan.COUPONNAME = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        Quan.COUPONCLASS = {
            "0": "",
            "1": "coupon-blue",
            "2": "coupon-orange",
            "3": "coupon-green"
        };

        Quan.prototype = {
            init: function () {
                var that = this,
                    vt = new FormVerified(document.forms.exchangeForm, function () {
                        that.activeCoupon();
                    });
                this.registerHHelper();
                $('#quan-tab').tab({
                    callback: function (obj) {
                        if (obj.attr('data-target') === "quan-exchangeBox") {
                            that.resetExchangeForm();
                        } else if (obj.attr('data-target') === "quan-myCouponBox") {
                            that.queryMyCouponList();
                        } else if (obj.attr('data-target') === "quan-findBox") {
                            that.queryCouponList();
                        }
                    }
                });
                this.listener();
            },

            listener: function () {
                var that = this;
                $('#qf-hasCoupon').on('click', 'a[data-role="getCoupon"]', function () {
                    that.getCoupon(this);
                });

                $('#quan-myCouponBox, #qf-couponList, #quan-exchangeSuccess').on('click', 'a[data-role="showAllSp"]', function () {
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
                    box = $('#quan-exchangeSuccess'),
                    input = $('#quan-exchangeInput'),
                    couponName = "",
                    i = 0,
                    length = 0,
                    item = null,
                    html = "",
                    source = $('#getcoupon_template').html(),
                    template = Handlebars.compile(source);
                data.resultSubType = data.resultList[0].resultSubType;
                data.discount = data.resultList[0].discount;
                data.couponClass = Quan.COUPONCLASS[data.resultSubType];
                data.couponType = Quan.COUPONNAME[data.resultSubType];
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
                box.empty().append(html);
                box.show();
                $('#qe-continue').on('click', function () {
                    that.resetExchangeForm();
                }); 
            },

            resetExchangeForm: function() {
                var that = this,
                    box = $('#quan-exchangeSuccess'),
                    input = $('#quan-exchangeInput');
                box.hide();
                input.val("").removeClass('invalid valid').select();
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

            queryMyCouponList: function () {
                var that = this,
                    request = new Ajax('/user/qryMyCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        that.writeCouponList(data.re, 1);
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            getCoupon: function (obj) {
                var that = this,
                    params = {
                       couponsIds: $(obj).attr('data-value') 
                    },
                    request = new Ajax('/user/fetchCouponsIds.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        dialog.show({
                            content: "领取成功"
                        });
                        that.queryCouponList();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            queryCouponList: function () {
                var that = this,
                    request = new Ajax('/user/findOutCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.list.length) {
                            that.writeCouponList(data.re, 2);
                        } else {
                            $('#qf-hasCoupon').hide();
                            $('#qf-noCoupon').show();
                        }
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            writeCouponList: function (data, type) {
                var that = this,
                    list = type === 1 ? $('#quan-myCouponBox') : $('#qf-couponList'),
                    html = "",
                    ids = "",
                    couponName = "",
                    i = 0,
                    length = 0,
                    items = [],
                    item = null,
                    source = type === 1 ? $('#mycoupon_template').html() : $('#findcoupon_template').html(),
                    template = Handlebars.compile(source),
                    addParams = function () {
                        couponName = "";
                        item.zIndex = Quan.ZINDEX;
                        Quan.ZINDEX -= 1;
                        if (item.type === 10) {
                            couponName += "全站通用";
                        } else if (item.type === 20) {
                            if (item.servicerSize !== 1) {
                                item.moreSize = item.servicerSize - 6;
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
                    };
                if (type === 1) {
                    for (i = 0, length = data.area.length; i < length; i += 1) {
                        item = data.area[i];
                        addParams();
                    }


                    for (i = 0, length = data.servicer.length; i < length; i += 1) {
                        item = data.servicer[i];
                        addParams();
                    }

                    for (i = 0, length = data.used.length; i < length; i += 1) {
                        item = data.used[i];
                        addParams();
                    }

                    for (i = 0, length = data.invali.length; i < length; i += 1) {
                        item = data.invali[i];
                        addParams();
                        item.couponClass = "coupon-gray";
                    }
                } else if (type === 2) {
                    for (i = 0, length = data.list.length; i < length; i += 1) {
                        item = data.list[i];
                        ids += data.list[i].couponid + (i < length - 1 ? "," : "");
                        addParams();
                    }
                    $('#qf-couponNum').html(length);
                    $('#qf-getAll').attr('data-value', ids);
                    $('#qf-hasCoupon').show();
                    $('#qf-noCoupon').hide();
                }
                
                

                html = template(data);
                list.empty().append(html);
            }
        };

        var quan = new Quan();
    });
}(window.requirejs));