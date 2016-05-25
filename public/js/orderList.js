(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', 'paginate', 'formVerified', 'tab', 'choice', 'chosen', 'glide'], function ($, Ajax, common, dialog, info, Handlebars, Paginate, FormVerified) {
    	function OrderList () {
            this.orderData = [];
            this.orderListPaginate = null;
    		this.init();
    	}

        OrderList.TIMEFLAG = "";

        OrderList.STATUS = "";

        OrderList.PAYTYPE = {
            "1": "线上支付",
            "2": "线下支付",
            "0": "其他",
            "-1": "未支付",
            "-2": "多种支付"
        };

        OrderList.STATUSTYPE = {
            '0': "待确认",
            '5': "待付款",
            '10': "已付款",
            '11': "已付款-金额有误",
            '15': "已收款",
            '20': "进行中",
            '30': "已完成",
            '40': "申请中止",
            '42': "已取消",
            '44': "已中止",
            '46': "已删除",
            '48': "已取消"
        };

        OrderList.CLASS = {
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

    	OrderList.prototype = {
    		init: function () {
    			$('input[type="checkbox"]').choice();
    			this.registerHHelper();
    			this.listener();
                this.chosenTab();
                
    		},

            chosenTab: function () {
                var that = this,
                    tab = $('#orderList-tab'),
                    activeid = common.getParams('tab') ? ("olt-" + common.getParams('tab')) : "olt-all";
                $('#' + activeid).addClass('active').siblings('li').removeClass('active');
                tab.tab({
                    callback: function (active) {
                        if (active[0].id === "olt-all") {
                            $('#orderList-selectBtn').addClass("active");
                            $('#orderList-select').find('li').each(function (index){
                                if (index === 1) {
                                    $(this).addClass('active');
                                } else {
                                    $(this).removeClass('active');
                                }
                            });
                        } else {
                            $('#orderList-selectBtn').removeClass("active");
                        }
                        that.packageOrderList(active.attr('data-status'), active.attr('data-appraise'), active.attr('data-payStatus'));
                    }
                });
            },

    		listener: function () {
    			var that = this;
                $('#orderList-select').on('click', 'li', function () {
                    var active = $(this);
                    that.packageOrderList(this.getAttribute('data-status'), this.getAttribute('data-appraise'));
                    active.addClass('active').siblings('li').removeClass('active');
                });

                $('#ol_list').on('click', '[data-role="delBtn"]', function () {
                    that.setOrderStatus(1, this.getAttribute('data-value'));
                }).on('click', '[data-role="confirmBtn"]', function () {
                    that.showMessageBox({
                        'orderno': this.getAttribute('data-value')
                    }, 'confirm');
                }).on('click', '[data-role="breakOffBtn"]', function () {
                    that.showMessageBox({
                        'orderno': this.getAttribute('data-value')
                    }, 'breakOff');
                }).on('click', '[data-role="cancelBtn"]', function () {
                    that.showMessageBox({
                        'orderno': this.getAttribute('data-value')
                    }, 'cancel');
                }).on('mouseenter', '[data-role="contactBtn"]', function () {
                    var btn = $(this),
                        data = btn.attr('data-value').split(',');
                    $('#orderList-contactorBox').html('<h4>' + data[0] + '</h4><p>联系人：' + data[1] + '</p><p>联系人电话：' + data[2] + '</p>').css({
                        top: btn.offset().top + btn.height(),
                        left: btn.offset().left + btn.width(),
                        display: "block"
                    });
                }).on('mouseleave', '[data-role="contactBtn"]', function () {
                    $('#orderList-contactorBox').hide();
                }).on('mouseenter', '[data-role="tracesBtn"]', function () {

                    that.showTraceBox(this);
                }).on('mouseleave', '[data-role="tracesBtn"]', function () {
                    OrderList.TIMEFLAG = setTimeout(function () {
                        $('#orderList-detailBox').hide();
                    }, 500);
                    
                }).on('mouseenter', 'tr[data-target]', function () {
                    $('#' + $(this).attr('data-target')).css({
                        display: 'inline-block'
                    });
                }).on('mouseleave', 'tr[data-target]', function () {
                    $('#' + $(this).attr('data-target')).removeAttr('style');
                });

                $('#orderList-detailBox').on('mouseenter', function () {
                    clearTimeout(OrderList.TIMEFLAG);
                }).on('mouseleave', function () {
                    $('#orderList-detailBox').hide();
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

            showMessageBox: function (data, type) {
                var that = this,
                    html = "",
                    source = "",
                    template = null;
                if (type === "confirm") {
                    source = $('#confirm_over_template').html();
                } else if (type === "breakOff") {
                    source = $('#break_off_template').html();
                } else if (type === "cancel") {
                    source = $('#cancel_template').html();
                }
                template = Handlebars.compile(source);
                html = template(data);
                info.show({
                    content: html
                });
                if (type === "cancel") {
                    $('#cancel_reason').chosen();
                }
                $('#message-box').on('click', 'a', function () {
                    if (this.id === "mb_confirmBtn") {
                        that.setOrderStatus(2, this.getAttribute('data-value') );
                    } else if (this.id === "mb_cancelBtn") {
                        info.close();
                    } else if (this.id === "mb_breakOffBtn") {
                        that.setOrderStatus(3, this.getAttribute('data-value') );
                    } else if (this.id === "mb_submitBtn") {
                        that.setOrderStatus(0, this.getAttribute('data-value') );
                    }
                });  
            },
            
            setOrderStatus: function (op, orderno) {
                var that = this,
                    request = null,
                    params = {
                        op: op,
                        orderno: orderno
                    };
                if (op === 0) {
                    if (!document.getElementById('cancel_reason').value) {
                        return;
                    }
                    params.desc = document.getElementById('cancel_reason').value;
                }

                request = new Ajax('/user/setNewOrderStatus.htm', params);
                request.done(
                    function (data) {
                        if (data.status === "200") {
                            if (op !== 1) {
                                info.close();
                            }
                            that.packageOrderList(OrderList.CURRENTTAB);
                        } else {
                            common.errorDialog(data);
                        }
                    });
            },

            registerHHelper: function () {
                Handlebars.registerHelper('toStatusString', function (value, options) {
                    return OrderList.STATUSTYPE[value];
                });

                Handlebars.registerHelper('toPaytypeString', function (value, options) {
                    return OrderList.PAYTYPE[value];
                });

                Handlebars.registerHelper('getClass', function (value, options) {
                    return OrderList.CLASS[value];
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
            },

            packageOrderList: function (status, appraise, payStatus) {
                var that = this;
                OrderList.STATUS = status;
                this.orderListPaginate = new Paginate({
                    position: "#ol_pager",
                    anchorPoint: "top-bar",
                    amount: 20,
                    currentPage: 1,
                    pages: 20,
                    data: {
                        status: status || "",
                        payStatus: payStatus || "",
                        appraise: appraise || "",
                        pageSize: 20,
                        pageNumber: 1
                    },
                    invoke: function () {
                        that.qryOrderList.apply(that, arguments);
                    }
                });
            },

            qryOrderList: function (paramsObj) {
                var that = this,
                    key = "",
                    params = {},
                    request = null;
                for (key in paramsObj) {
                    params[key] = paramsObj[key];
                }
                delete params.func;
                request = new Ajax('/user/qryNewOrderList.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.orderData = data.re.orderList;
                        that.writeTable(data.re);
                        paramsObj.func(that.orderListPaginate, params.pageSize, params.pageNumber, data.re.totalPage);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            writeTable: function (data) {
                var html = "",
                    box = $('#ol_list'),
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
                    fitem = null,
                    citem = null,
                    sitem = null,
                    ordernos = "",
                    optionsItems = [],
                    optionsHtml = [],
                    ids = "",
                    needPayOrder = 0,
                    remainamount = 0,
                    source = $('#order_list_template').html(),
                    template = Handlebars.compile(source);
                for (i = 0, iLen = data.orderList.length; i < iLen; i += 1) {
                    fitem = data.orderList[i];
                    ordernos = "";
                    ids = "";
                    remainamount = 0;
                    needPayOrder = 0;
                    fitem.canDel = true;
                    for (j = 0, jLen = fitem.list.length; j < jLen; j += 1) {
                        citem = fitem.list[j];
                        citem.porderno = fitem.orderno;
                        if (citem.orderpayid !== "") {
                            needPayOrder += 1;
                            ordernos += citem.orderno + ",";
                            ids  += citem.orderpayid + ",";
                            remainamount += citem.remainamount*1;
                        }

                        if (fitem.ordertype === "2" && citem.status*1 < 30) {
                            fitem.canDel = false;
                        }

                        if (citem.status*1 < 30){
                            citem.canDel = false;
                        } else if (citem.status*1 >= 30) {
                            citem.canDel = true;
                        }

                    }
                    fitem.showCPayBtn = needPayOrder > 1 ? true : false;
                    fitem.ordernos = ordernos.substr(0, ordernos.length - 1);
                    fitem.remainamount = remainamount.toFixed(1);
                    fitem.orderpayids = ids.substr(0, ids.length - 1);
                }


                for (i = 0, iLen = data.orderList.length; i < iLen; i += 1) {
                    fitem = data.orderList[i];
                    for (j = 0, jLen = fitem.list.length; j < jLen; j += 1) {
                        citem = fitem.list[j];
                           for (k = 0, kLen = citem.serviceItemsList.length; k < kLen; k += 1) {
                                for (l = 0, lLen = citem.serviceItemsList[k].length; l < lLen; l += 1) {
                                    sitem = citem.serviceItemsList[k][l];
                                    if (sitem.serviceImgs !== "") {
                                        sitem.serviceImg = sitem.serviceImgs.split(',')[0];
                                    } else {
                                        sitem.serviceImg = "/public/img/serviceCover_80x64.png";
                                    }
                                    if (sitem.options !== "") {
                                        optionsItems = sitem.options.split('|');
                                        sitem.optionsList = [];
                                        for (m = 0, mLen = optionsItems.length; m < mLen; m += 1) {
                                            if (optionsItems[m] !== "") {
                                                optionsHtml = optionsItems[m].replace(/^\d,/, "");
                                                optionsHtml = optionsHtml.replace(/,/, "：");
                                                sitem.optionsList.push(optionsHtml);
                                            }
                                        }
                                    } else {
                                        sitem.optionsList = [];
                                    }
                                } 
                           }
                        }
                    }
                
                box.empty();
                if (data.totalRow) {
                    html = template(data);
                    $(html).appendTo(box);
                }
            }
    	};

    	var orderList = new OrderList();
    });
}(window.requirejs));