(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', 'paginate', "formVerified", 'tab', 'glide'], function ($, Ajax, common, dialog, info, Handlebars, Paginate, FormVerified) {
    	function MyService () {
            this.serviceList = [];
    		this.init();
    	}

        MyService.status = {
            "0": "待启动",
            "15": "待启动",
            "20": "已启动",
            "30": "已完成",
            "40": "申请中止",
            "42": "已取消",
            "44": "已中止"
        };


    	MyService.prototype = {
    		init: function () {
                this.chosenTab();
                this.listener();
                this.registerHHelper();
    		},

            chosenTab: function () {
                var that = this,
                    tab = $('#myService-tab'),
                    activeid = common.getParams('tab') ? ("mst-" + common.getParams('tab')) : "mst-all";
                $('#' + activeid).addClass('active').siblings('li').removeClass('active');
                tab.tab({
                    callback: function (active) {
                        that.packageServiceList(active.attr('data-status'), active.attr('data-isreview'), active.attr('data-confirmfinished'));
                    }
                });
            },

            listener: function () {
                var that = this;
                $('#sl-list').on('click', '.ms-step-past', function () {
                    var tab = $(this),
                        target = tab.attr('data-target');
                    tab.addClass('active').siblings('li').removeClass('active');
                    $('#' + target).addClass('active').siblings('li').removeClass('active');
                });

                $('#sl-list').on('click', '[data-role="confirmBtn"]', function () {
                    that.showMessageBox({
                        'id': this.getAttribute('data-value'),
                        'orderno': this.getAttribute('data-orderno')
                    }, 'confirm');
                }).on('click', '[data-role="breakOffBtn"]', function () {
                    that.showMessageBox({
                        'id': this.getAttribute('data-value')
                    }, 'breakOff');
                }).on('click', '[data-role="commitBtn"]', function () {
                    that.queryUnReview($(this).attr('data-value'));
                }).on('mouseenter', '[data-role="contactBtn"]', function () {
                    var btn = $(this),
                        data = btn.attr('data-value').split(',');
                    $('#orderList-contactorBox')
                        .html('<h4>' + data[0] + '</h4><p>联系人：' + data[1] + '</p><p>联系电话：' + data[2] + '</p>')
                        .css({
                            top: btn.offset().top + btn.height(),
                            left: btn.offset().left + btn.width(),
                            display: "block"
                        });
                }).on('mouseleave', '[data-role="contactBtn"]', function () {
                    $('#orderList-contactorBox').hide();
                });
            },

            queryUnReview: function (value) {
                var that = this,
                    params = {
                        osid: value  
                    },
                    request = new Ajax('/user/qryUnReview8OSID.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                            that.showAppraisebox(data.re);
                    } else {
                        common.errorDialog(data);
                    }
                }); 
            },

            showAppraisebox: function (data) {
                var that = this,
                    i = 0,
                    iLen = 1,
                    html = "",
                    source = $('#appraise-template').html(),
                    template = Handlebars.compile(source);
                data.list = [data.orderservice];
                for (i = 0; i < iLen; i += 1) {
                    if (data.list[i].serviceImgs !== "") {
                        data.list[i].serviceImg = data.list[i].serviceImgs.split(',')[0];
                    }
                }
                html = template(data);
                info.show({
                    content: html,
                    closeAction: function () {
                        var activeBtn = $('#myService-tab .active');
                        that.packageServiceList(activeBtn.attr('data-status'), activeBtn.attr('data-isreview'));
                    }
                });
                this.addAppraiseAction();
            },

            addAppraiseAction: function () {
                var that = this,
                    form = document.forms.appraiseForm,
                    appraiseVt = new FormVerified(form, function () {
                        that.submitAppraise();
                    }, true);
                $('#appraise-items').glide({
                    callback: function (obj) {
                        that.queryAppraise(obj);
                    }
                });
                $('#appraise-content span[data-role="starBox"]').on('mouseleave', function () {
                    var id = $(this).attr('id').split('-')[1];
                    $('#ac-' + id + '-show').html((form[id].value ? form[id].value : 0) + "分");
                    $(this).children('i').removeClass('unactive active');
                }).on('click', 'i', function () {
                    var id = $(this).attr('data-target'),
                        point = $(this).index() + 1;
                    $('#ac-' + id + '-line').removeClass().addClass('ac-line ac-star-on-' + point);
                    $('#ac-' + id + '-show').html(point + "分");
                    form[id].value = point;
                }).on('mouseenter', 'i', function () {
                    var id = $(this).attr('data-target'),
                        point = $(this).index() + 1;
                    $(this).siblings('i').removeClass('active').addClass('unactive');
                    $('#ac-' + id + '-show').html(point + "分");
                    $(this).removeClass('unactive').addClass('active').prevAll('i').removeClass('unactive').addClass('active');
                });
            },

            queryAppraise: function (obj) {
                var that = this,
                    params = {
                        osid: obj.attr('data-osid')  
                    },
                    request = new Ajax('/user/osReviewDetail8OSID.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.orderservicesList.length) {
                            that.resetAppraiseForm(data.re.orderservicesList[0]);
                        } else {
                            that.resetAppraiseForm({
                                content: "",
                                id: obj.attr('data-osid'),
                                oossid: obj.attr('data-oossid'),
                                professional: "",
                                respond: "",
                                service: "",
                                total: ""
                            });
                        }
                        
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            resetAppraiseForm: function (data) {
                var that =this,
                    form = document.forms.appraiseForm;
                form.total.value = data.total;
                if (data.total) {
                    $('#ac-total-show').html(data.total + "分");
                    $('#ac-total-line').addClass("ac-star-on-" + data.total);
                } else {
                    $('#ac-total-line').removeClass().addClass("ac-line");
                    $('#ac-total-show').html("0分");
                }
                form.respond.value = data.respond;
                if (data.respond) {
                    $('#ac-respond-show').html(data.respond + "分");
                    $('#ac-respond-line').addClass("ac-star-on-" + data.respond);
                } else {
                    $('#ac-respond-line').removeClass().addClass("ac-line");
                    $('#ac-respond-show').html("0分");
                }
                form.service.value = data.service;
                if (data.service) {
                    $('#ac-service-show').html(data.service + "分");
                    $('#ac-service-line').addClass("ac-star-on-" + data.service);
                } else {
                    $('#ac-service-line').removeClass().addClass("ac-line");
                    $('#ac-service-show').html("0分");
                }
                form.professional.value = data.professional;
                if (data.professional) {
                    $('#ac-professional-show').html(data.professional + "分");
                    $('#ac-professional-line').addClass("ac-star-on-" + data.professional);
                } else {
                    $('#ac-professional-line').removeClass().addClass("ac-line");
                    $('#ac-professional-show').html("0分");
                }
                form.content.value = data.content;
                form.osid.value = data.id;
                form.oossid.value = data.oossid;
            },

            submitAppraise: function () {
                var that = this,
                    form = document.forms.appraiseForm,
                    activeBtn = $('#myService-tab .active'),
                    lis = $('#appraise-list').find('li'),
                    params = {
                        oossid: form.oossid.value,
                        total: form.total.value,
                        respond: form.respond.value,
                        service: form.service.value,
                        professional: form.professional.value,
                        content: form.content.value,
                        osid: form.osid.value
                    },
                    request = new Ajax('/user/addOSReview.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (lis.length > 1) {
                            $('#appraise-list').find('.active').remove();
                            $('#appraise-list').trigger('glide:update');
                        } else {
                            info.close();
                        }
                    } else {
                    }
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
                        that.setOrderStatus(-1, this.getAttribute('data-value'));
                    } else if (this.id === "mb_cancelBtn") {
                        info.close();
                    } else if (this.id === "mb_breakOffBtn") {
                        that.setOrderStatus(3, this.getAttribute('data-value'));
                    } else if (this.id === "mb_submitBtn") {
                        that.setOrderStatus(0, this.getAttribute('data-value'));
                    }
                });  
            },
            
            setOrderStatus: function (op, value) {
                var that = this,
                    request = null,
                    activeBtn = $('#myService-tab .active'),
                    params = {
                        status: op,
                        id: value
                    };
                if (op === 0) {
                    if (!document.getElementById('cancel_reason').value) {
                        return;
                    }
                    params.desc = document.getElementById('cancel_reason').value;
                }

                request = new Ajax('/user/updateOrderServiceById.htm', params);
                request.done(
                    function (data) {
                        if (data.status === "200") {
                            if (op !== 1) {
                                info.close();
                            }
                            that.packageServiceList(activeBtn.attr('data-status'), activeBtn.attr('data-isreview'));
                            if (op === -1) {
                                that.queryUnReview(value);
                            }
                        } else {
                            common.errorDialog(data);
                        }
                    });
            },

            registerHHelper: function () {
                Handlebars.registerHelper('addOne', function (value) {
                    return value + 1;
                });

                Handlebars.registerHelper('toText', function (value) {
                    return MyService.status[value];
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

            packageServiceList: function (status, isreview, confirmfinished) {
                var that = this;
                this.orderListPaginate = new Paginate({
                    position: "#sl_pager",
                    anchorPoint: "top-bar",
                    amount: 20,
                    currentPage: 1,
                    pages: 20,
                    data: {
                        status: status || "",
                        isreview: isreview || "",
                        confirmfinished: confirmfinished || "",
                        pageSize: 20,
                        pageNumber: 1
                    },
                    invoke: function () {
                        that.qryServiceList.apply(that, arguments);
                    }
                });
            },

            qryServiceList: function (paramsObj) {
                var that = this,
                    key = "",
                    params = {},
                    request = null;
                for (key in paramsObj) {
                    params[key] = paramsObj[key];
                }
                delete params.func;
                request = new Ajax('/user/qryOrderServiceList.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.writeList(data.re);
                        that.serviceList = data.re.ordersServicesList;
                        paramsObj.func(that.orderListPaginate, params.pageSize, params.pageNumber, data.re.totalPage);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            writeList: function (data) {
                var html = "",
                    i = 0,
                    j = 0,
                    iLen = 0,
                    jLen = 0,
                    item = null,
                    items = data.ordersServicesList,
                    box = $('#sl-list'),
                    source = $('#service_list_template').html(),
                    template = Handlebars.compile(source);
                box.empty();
                if (data.totalRow) {
                    for (i = 0, iLen = items.length; i < iLen; i += 1) {
                        for (j = 0, jLen = items[i].traces.length; j < jLen; j += 1) {
                            item = items[i].traces[j];
                            item.server = items[i].servicer.contacts;
                            if (j < jLen - 1 && item.status !== items[i].traces[j + 1].status || j === jLen -1 && item.status === "1"){
                                item.active = true;
                            }
                        }
                    }
                    html = template(data);
                    $(html).appendTo(box);
                }
            }
    	};

    	var myService = new MyService();
    });
}(window.requirejs));