(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'handlebars', 'dialog', 'info', "formVerified", 'glide'], function ($, Ajax, common, Handlebars, dialog, info, FormVerified) {
    	function MyServiceInfo () {
            //this.serviceList = null;
            this.serviceData = null;
    		this.init();
    	}

        MyServiceInfo.OSSTATUSTEXT = {
            '0': "未启动",
            '15': "待启动",
            '20': "服务中",
            '30': "已完成",
            '40': "申请中止",
            '42': "已取消",
            '44': "已中止"
        };

        MyServiceInfo.status = {
            "0": "待启动",
            "15": "待启动",
            "20": "已启动",
            "30": "已完成",
            "40": "申请中止",
            "42": "已取消",
            "44": "已中止"
        };

    	MyServiceInfo.prototype = {
    		init: function () {
                this.registerHHelper();
                this.queryServiceDetail();
                this.listener();
    		},

            listener: function () {
                var that = this;
                $('#myService-steps').on('click', '[data-role="confirmBtn"]', function () {
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
                        that.queryServiceDetail();
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
                            that.queryServiceDetail();
                            if (op === -1) {
                                that.queryUnReview(value);
                            }
                        } else {
                            common.errorDialog(data);
                        }
                    });
            },

            queryServiceDetail: function () {
                var that = this,
                    params = {
                        orderno: common.getParams('orderno'),
                        oossid: common.getParams('oossid') ? common.getParams('oossid') : "", 
                        serviceid: common.getParams('serviceid') ? common.getParams('serviceid'): ""
                    },
                    request = new Ajax('/user/qryOrderServicesList8OrderNo.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.serviceData = data.re;
                        that.fillPage();
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
                    return MyServiceInfo.status[value];
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

            fillPage: function () {
                this.fillList();
                this.fillInfo();
            },

           

            fillList: function () {
                var that = this,
                    list = $('#myService-steps'),
                    html = "",
                    servicesHtml = [],
                    i = 0,
                    j = 0,
                    items = [],
                    item = null,
                    sdnames = this.serviceData.sdnames.split(','),
                    sdids = this.serviceData.sdids.split(','),
                    iLen = 0,
                    jLen = 0,
                    source = $('#step_template').html(),
                    template = Handlebars.compile(source);
                for (i = 0, iLen = this.serviceData.ordersServicesList.length; i < iLen; i += 1) {
                    items = this.serviceData.ordersServicesList[i].traces;
                    for(j = 0, jLen = items.length; j < jLen; j += 1) {
                        item = this.serviceData.ordersServicesList[i].traces[j];
                        if (j === 0) {
                        item.className += " first-child";
                        }
                        if (item.status === "1") {
                            item.servername = this.serviceData.servicer.contacts;
                            item.servermobile = this.serviceData.servicer.contactstel;
                            item.className += " msi-step-past";
                        }
                        if (j < jLen - 1 && item.status !== items[j + 1].status || j === jLen -1 && item.status === "1"){
                            item.className += " active";
                        }
                        if (j === jLen - 1){
                            item.className += " last-child";
                        }
                    }
                    //servicesHtml.push('<a href="/service/qryServiceDetailByCodeJsp.htm?id=' + this.serviceData.ordersServicesList[i].serviceid + '">' + this.serviceData.ordersServicesList[i].siname + '</a>');
                }
                html = template(this.serviceData);
                list.empty().append(html);

                for (i = 0, iLen = sdnames.length; i < iLen; i += 1) {
                    if (sdnames[i]) {
                        servicesHtml.push('<a target="_blank" href="/service/qryServiceDetailByCodeJsp.htm?id=' + sdids[i] + '">' + sdnames[i] + '</a>');
                    }
                }
                $('#msi-srname').html(servicesHtml.join(','));
            },

            fillInfo: function () {
                $('#msi-orderno').html(this.serviceData.orderno);
                $('#msi-status').html(MyServiceInfo.OSSTATUSTEXT[this.serviceData.orderStatus]);
                $('#msi-serviceVersion').html("【" + this.serviceData.serviceVersion + "】");
                $('#msi-name').html(this.serviceData.servicer.name);
                $('#msi-tel').html(this.serviceData.servicer.tel);
                $('#msi-serviceName').html(this.serviceData.servicer.serviceName);
                $('#msi-contacts').html(this.serviceData.servicer.contacts);
                $('#msi-contactstel').html(this.serviceData.servicer.contactstel);
                $('#msi-address').html(this.serviceData.servicer.address);
                /*$('#msi-advisermobile').html(this.serviceData.advisermobile);
                $('#msi-adviserrealname').html(this.serviceData.adviserrealname);*/
            }
    	};

    	var myServiceInfo = new MyServiceInfo();
    });
}(window.requirejs));