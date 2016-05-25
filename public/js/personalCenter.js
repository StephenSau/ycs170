(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', 'glide'], function ($, Ajax, common, dialog, info, Handlebars) {
    	function PersonalCenter () {
            this.orderData = [];
    		this.init();
    	}

        PersonalCenter.PAYTYPE = {
            "1": "线上支付",
            "2": "线下支付",
            "0": "其他",
            "-1": "未支付",
            "-2": "多种支付"
        };

        PersonalCenter.STATUSTYPE = {
            "0": "待确认",
            "5": "待付款",
            "10": "已付款",
            "11": "已付款-金额有误",
            "15": "已收款",
            "20": "进行中",
            "30": "已完成",
            "40": "申请中止",
            "42": "已取消",
            "44": "已删除",
            "46": "已取消",
            "48": "已中止"
        };

        PersonalCenter.CLASS = {
            '0': "ol-orange",
            '5': "ol-orange",
            '10': "ol-blue",
            '11': "ol-blue",
            '15': "ol-blue",
            '20': "ol-blue",
            '30': "ol-green",
            '40': "ol-gray",
            '42': "ol-gray",
            '44': "ol-gray",
            '46': "ol-gray",
            '48': "ol-gray"
        };

        PersonalCenter.TIMEFLAG = null;
    	PersonalCenter.prototype = {
    		init: function () {
                this.registerHHelper();
                this.listener();
    			this.fillUserInfo();
                this.queryMyCouponList();
                this.queryCouponList();
                this.queryOrderList();    
    		},

            

            listener: function () {
                var that = this,
                    shopList = $('#shopList'),
                    detailBox = $('#orderList-detailBox');
                $('#pcbl-list').on('mouseleave', '[data-role="contactBtn"]', function () {
                    $('#orderList-contactorBox').hide();
                }).on('mouseenter', '[data-role="tracesBtn"]', function () {
                    that.showTraceBox(this);
                }).on('mouseleave', '[data-role="tracesBtn"]', function () {
                    PersonalCenter.TIMEFLAG = setTimeout(function () {
                        detailBox.hide();
                    }, 200);
                });
                $('#orderList-detailBox').on('mouseenter', function () {
                    clearTimeout(PersonalCenter.TIMEFLAG);
                }).on('mouseleave', function () {
                    detailBox.hide();
                });


                $('#pcbs-coupon-list, #pcbr-coupon-list').on('mouseenter', '.coupon-range', function () {
                    if ($(this).find('.coupon-shopList').length){
                        var width = $(this).find('.coupon-one').length ? 230 : 420;
                        shopList
                            .empty()
                            .append($(this).find('.coupon-shopList').clone())
                            .css({
                                'position': 'absolute',
                                'display': "block",
                                'top': $(this).offset().top,
                                'left': $(this).offset().left - width
                            });
                    }
                }).on('mouseleave', function () {
                    PersonalCenter.TIMEFLAG = setTimeout(function () {
                        shopList.empty().hide();
                    }, 50);
                });

                shopList.on('mouseenter', function() {
                    clearTimeout(PersonalCenter.TIMEFLAG);
                }).on('mouseleave', function () {
                    shopList.empty().hide();
                });

                $('#pcbr-coupon').on('click', 'a[data-role="getCoupon"]', function () {
                    that.getCoupon(this);
                });

                $('#shopList').on('click', 'a[data-role="showAllSp"]', function () {
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

            showTraceBox: function (obj) {
                var that = this,
                    btn = $(obj),
                    box = $('#orderList-detailBox'),
                    orderInfo = null,
                    html = "",
                    data = {},
                    i = 0,
                    j = 0,
                    iLen = 0,
                    source = $('#trace_template').html(),
                    template = Handlebars.compile(source),
                    temp = {},
                    jLen = 0,
                    items = this.orderData,
                    orderno = btn.attr('data-value');
                for(i = 0, iLen = items.length; i < iLen; i += 1) {
                    for (j = 0, jLen = items[i].list.length; j < jLen; j += 1) {
                        if (items[i].list[j].orderno === orderno) {
                            orderInfo = items[i].list[j];
                        }
                    }
                }
                data.orderno = orderno;
                data.list = [];
                if (orderInfo.finished) {
                    temp = {};
                    temp.content = "订单完成";
                    temp.time = orderInfo.finished;
                    data.list.push(temp);
                }

                if (orderInfo.canceled) {
                    temp = {};
                    temp.content = "您取消了订单";
                    temp.time = orderInfo.canceled;
                    data.list.push(temp);
                }

                if (orderInfo.stoped) {
                    temp = {};
                    temp.content = "您中止了订单";
                    temp.time = orderInfo.stoped;
                    data.list.push(temp);
                }

                if (orderInfo.osStarted) {
                    temp = {};
                    temp.content = "服务商启动服务";
                    temp.time = orderInfo.osStarted;
                    data.list.push(temp);
                }


                if (orderInfo.paid) {
                    temp = {};
                    temp.content = "您的订单已付款，服务商确认收款后将启动服务";
                    temp.time = orderInfo.paid;
                    data.list.push(temp);
                }

                if (orderInfo.confirmed) {
                    temp = {};
                    temp.content = "您的订单已确认,请尽快付款";
                    temp.time = orderInfo.confirmed;
                    data.list.push(temp);
                }

                if (orderInfo.created) {
                    temp = {};
                    temp.content = "您提交了订单,请等待服务商确认";
                    temp.time = orderInfo.created;
                    data.list.push(temp);
                }

                if (data.list.length > 3) {
                    data.list[2].thirdChild = true;
                    data.list[3].lastChild = true;
                    data.list[3].content = "...";
                    data.list[3].time = false;
                    data.list.splice(4, data.list.length - 4);
                } else if (data.list.length === 3) {
                    data.list[2].lastChild = true;
                } else if (data.list.length === 2) {
                    data.list[1].lastChild = true;
                } else if (data.list.length === 1) {
                    data.list[0].lastChild = true;
                }
                
                box.empty();
                html = template(data);
                $(html).appendTo(box);
                box.css({
                    top: $(obj).offset().top,
                    left: $(obj).offset().left - 422 - 20,
                    display: 'block'
                });
            },

            registerHHelper: function () {
                Handlebars.registerHelper('getCouponType', function (value, options) {
                    if (value === "直减") {
                        return "coupon-blue";
                    } else if (value === "折扣") {
                        return "coupon-orange";
                    } else if (value === "一口价") {
                        return "coupon-green";
                    }
                });

                Handlebars.registerHelper('toStatusString', function (value, options) {
                    return PersonalCenter.STATUSTYPE[value];
                });

                Handlebars.registerHelper('toPaytypeString', function (value, options) {
                    return PersonalCenter.PAYTYPE[value];
                });

                Handlebars.registerHelper('getClass', function (value, options) {
                    return PersonalCenter.CLASS[value];
                });
                
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

            fillUserInfo: function () {
                function query() {
                    if (common.userInfo){
                        $('#pcbsu-name').html(common.userInfo.username);
                        $('#pcbsu-company').html(common.userInfo.nickname);
                        if (common.userInfo.mobile) {
                            $('#pcbsu-mobile').addClass('pcbsu-binded').html("已绑定手机 " + common.userInfo.mobile);
                        } else {
                            $('#pcbsu-mobile').addClass('pcbsu-unbind').html('未绑定手机');
                        }

                        if (common.userInfo.email) {
                            $('#pcbsu-email').addClass('pcbsu-binded').html("已绑定邮箱 " + common.userInfo.email);
                        } else {
                            $('#pcbsu-email').addClass('pcbsu-unbind').html('未绑定邮箱');
                        }

                        if (common.userInfo.isQQBind === "1") {
                            $('#pcbsu-qq').addClass('pcbsu-binded').html("已绑定QQ");
                        } else {
                            $('#pcbsu-qq').addClass('pcbsu-unbind').html('未绑定QQ');
                        }

                        if (common.userInfo.isWeachat === "1") {
                            $('#pcbsu-wx').addClass('pcbsu-binded').html("已绑定微信");
                        } else {
                            $('#pcbsu-wx').addClass('pcbsu-unbind').html('未绑定微信');
                        }

                        $('#pcbsl-unpay').html(common.userInfo.waitPayCount);
                        $('#pcbsl-service').html(common.userInfo.workinCount);
                        $('#pcbsl-comment').html(common.userInfo.waitReviewCount);
                        
                    } else{
                        setTimeout(query, 50);
                    }
                }
                query();                     
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

            queryCouponList: function () {
                var that = this,
                    request = new Ajax('/user/findOutCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        that.writeCouponList(data.re, 2);
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            writeCouponList: function (data, type) {
                var that = this,
                    list = type === 1 ? $('#pcbs-coupon-list') : $('#pcbr-coupon-list'),
                    html = "",
                    couponName = "",
                    i = 0,
                    length = 0,
                    items = [],
                    item = null,
                    source = $('#coupon_template').html(),
                    template = Handlebars.compile(source);
                if (type === 1) {
                    if (data.area.length) {
                        for (i = 0, length = data.area.length; i < length; i += 1) {
                            items.push(data.area[i]);
                        }
                    }
                    if (data.servicer.length) {
                        for (i = 0, length = data.servicer.length; i < length; i += 1) {
                            items.push(data.servicer[i]);
                        }  
                    }
                    $('#pcbs-coupon-num').html(items.length);
                } else if (type === 2) {
                    items = data.list;
                }

                if (!items.length) {
                    if (type === 1) {
                        $('#pcbs-coupon').empty().append('<p class="pcbs-emptyLine">暂无优惠券</p>');
                    } else if (type === 2) {
                        $('#pcbr-coupon').empty().append('<p class="pcbr-emptyLine">暂未发现优惠券</p>');
                    }
                    return;
                }
                

                for (i = 0, length = items.length; i < length; i += 1) {
                    item = items[i];
                    couponName = "";
                    if (item.type === 10) {
                        couponName += "全站通用";
                        item.ctype = "global";
                    } else if (item.type === 20) {
                        if (item.servicerSize !== 1) {
                            item.moreSize = item.servicerSize - 6;
                            couponName += "限定店铺";
                            item.ctype = "some";
                        } else if (item.servicerSize === 1) {
                            couponName += item.servicerList[0].nickname;
                            item.servicerId = item.servicerList[0].srid;
                            item.ctype = "one";
                        }
                    }

                    if (item.implement === 10) {
                        couponName += "优惠卡";
                    } else if (item.implement === 20) {
                        couponName += "优惠券";
                    }
                    if (type === 2) {
                        item.ctype = "none";
                    }
                    item.couponName = couponName;
                }
                html = template(items);
                list.empty().append(html);
                if (type === 1) {
                    $('#pcbs-coupon').glide();
                } else if (type === 2) {
                    $('#pcbr-coupon').glide();
                }
            },

            getCoupon: function (obj) {
                var that = this,
                    params = {
                       couponsIds: $(obj).attr('data-value') 
                    },
                    request = new Ajax('/user/fetchCouponsIds.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        window.location.reload();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            queryOrderList: function () {
                var that = this,
                    noneLine = $('#pcblr-noneLine'),
                    params = {
                        pageNumber: 1,
                        pageSize: 3,
                        status: "",
                        payStatus: "",
                        appraise: ""
                    },
                request = new Ajax('/user/qryNewOrderList.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.orderList.length) {
                            that.orderData = data.re.orderList;
                            that.writeTable(data.re);
                            
                        } else {
                            noneLine.addClass('active');
                        }
                        
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            writeTable: function (data) {
                var that = this,
                    tbody = $('#pcbl-list'),
                    html = "",
                    i = 0,
                    j = 0,
                    k = 0,
                    l = 0,
                    m = 0,
                    iLen = 0,
                    jLen = 0,
                    kLen = 0,
                    lLen = 0,
                    mLen = 0,
                    list = [],
                    optionsItems = [],
                    optionsHtml = [],
                    temp = {},
                    itemj = {},
                    iteml = {},
                    source = $('#order-list-template').html(),
                    template = Handlebars.compile(source);
                for(i = 0, iLen = data.orderList.length; i < iLen; i += 1) {
                    for (j = 0, jLen = data.orderList[i].list.length; j < jLen; j += 1) {
                        temp = {};
                        itemj = data.orderList[i].list[j];
                        temp.srcontacts = itemj.srcontacts;
                        temp.srcontactstel = itemj.srcontactstel;
                        temp.due = itemj.due;
                        if (itemj.paidAmountSum !== "0"){
                            temp.hasPaidFlag = true;
                        }
                        temp.paidAmountSum = itemj.paidAmountSum;
                        temp.subOrderPaytype = PersonalCenter.PAYTYPE[itemj.subOrderPaytype];
                        temp.created = itemj.created;
                        temp.orderno = itemj.orderno;
                        temp.status = itemj.status;
                        temp.statusText = PersonalCenter.STATUSTYPE[itemj.status];
                        for (k = 0, kLen = itemj.serviceItemsList.length; k < kLen; k += 1) {
                            if (k > 0){
                                continue;
                            }
                            for(l = 0, lLen = itemj.serviceItemsList[k].length; l < lLen; l += 1) {
                                if (l > 0){
                                    continue;
                                } 
                                iteml = itemj.serviceItemsList[k][l];
                                if (iteml.serviceImgs !== "") {
                                    temp.serviceImg = iteml.serviceImgs.split(',')[0];
                                } else {
                                    temp.serviceImg = "/public/img/serviceCover_80x64.png";
                                }
                                if (iteml.options !== "||") {
                                    optionsItems = iteml.options.split('|');
                                    for (m = 0, mLen = optionsItems.length; m < mLen; m += 1) {
                                        if (optionsItems[m] !== "") {
                                            temp.optionsList = [];
                                            optionsHtml = optionsItems[m].replace(/^\d,/, "");
                                            optionsHtml = optionsHtml.replace(/,/, "：");
                                            temp.optionsList.push(optionsHtml);
                                        }
                                    }
                                } else {
                                    temp.optionsList = [];
                                }
                                temp.sdname = iteml.sdname;
                                temp.siname = iteml.siname;
                                temp.sdid = iteml.sdid;
                            }     
                        }
                        list.push(temp);
                        if (list.length === 3) {
                            break;
                        }
                        break;
                    }
                }
                html = template(list);
                tbody.empty().append(html);
            }
    	};

    	var personalCenter = new PersonalCenter();
    });
}(window.requirejs));