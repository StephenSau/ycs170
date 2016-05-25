(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', 'paginate', "formVerified", 'choice', 'chosen', 'glide'], function ($, Ajax, common, dialog, info, Handlebars, Paginate, FormVerified) {
    	function Comments () {
            this.commentsData = null;
            this.commentsPaginate = null;
    		this.init();
    	} 

        Comments.STATUS = "0";

    	Comments.prototype = {
    		init: function () {
    			$('input[type="checkbox"]').choice();
    			this.listener();
                this.packageComments();
    		},

    		listener: function () {
    			var that = this;
                $('#comments-tab').on('click', 'li', function () {
                    that.packageComments($(this).attr('data-value'));
                    $(this).addClass('active').siblings('li').removeClass('active');
                });
                $('#comments-list').on('click', 'a[data-role="commitBtn"]', function () {
                    that.queryUnReview(this);
                });
    		},

            queryUnReview: function (obj) {
                var that = this,
                    i = 0,
                    iLen = this.commentsData.orderServiceList.length,
                    item = null,
                    data = {};
                data.list = [];
                data.list.push({});
                for (i = 0; i < iLen; i += 1) {
                    item = this.commentsData.orderServiceList[i];
                    if ($(obj).attr('data-value') === item.id.toString()) {
                        data.list[0].serviceImgs = item.serviceImgs || "";
                        data.list[0].osid = item.id;
                        data.list[0].oossid = item.oossid;
                        data.list[0].sdname = item.servicename;
                        data.list[0].siname = item.siname;
                        data.list[0].created = item.created;
                        break;
                    }
                }
                that.showAppraisebox(data);
            },

            showAppraisebox: function (data) {
                var that = this,
                    html = "",
                    i = 0,
                    iLen = data.list.length,
                    source = $('#appraise-template').html(),
                    template = Handlebars.compile(source);
                for (i = 0; i < iLen; i += 1) {
                    if (data.list[i].serviceImgs !== "") {
                        data.list[i].serviceImg = data.list[i].serviceImgs.split(',')[0];
                    }
                }
                html = template(data);
                info.show({
                    content: html
                });
                this.addAppraiseAction();
            },

            addAppraiseAction: function () {
                var that = this,
                    form = document.forms.appraiseForm,
                    appraiseVt = new FormVerified(form, function () {
                        that.submitAppraise();
                    }, true);
                that.queryAppraise($('#appraise-list').children('li').eq(0));
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
                    $('#ac-total-show').html("0分");
                }
                form.respond.value = data.respond;
                if (data.respond) {
                    $('#ac-respond-show').html(data.respond + "分");
                    $('#ac-respond-line').addClass("ac-star-on-" + data.respond);
                } else {
                    $('#ac-respond-show').html("0分");
                }
                form.service.value = data.service;
                if (data.service) {
                    $('#ac-service-show').html(data.service + "分");
                    $('#ac-service-line').addClass("ac-star-on-" + data.service);
                } else {
                    $('#ac-service-show').html("0分");
                }
                form.professional.value = data.professional;
                if (data.professional) {
                    $('#ac-professional-show').html(data.professional + "分");
                    $('#ac-professional-line').addClass("ac-star-on-" + data.professional);
                } else {
                    $('#ac-professional-show').html("0分");
                }
                form.content.value = data.content;
                form.osid.value = data.id;
                form.oossid.value = data.oossid;

            },

            submitAppraise: function () {
                var that = this,
                    form = document.forms.appraiseForm,
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
                        info.close();
                        that.packageComments(Comments.STATUS);
                    } else {

                    }
                });
            },
            
            packageComments: function (value) {
                var that = this;
                Comments.STATUS = value;
                this.commentsPaginate = new Paginate({
                    position: "#ol_pager",
                    anchorPoint: "top-bar",
                    amount: 20,
                    currentPage: 1,
                    pages: 20,
                    data: {
                        review: value || Comments.STATUS,
                        pageSize: 20,
                        pageNumber: 1
                    },
                    invoke: function () {
                        that.qryComments.apply(that, arguments);
                    }
                });
            },

            qryComments: function (paramsObj) {
                var that = this,
                    key = "",
                    params = {},
                    request = null;
                for (key in paramsObj) {
                    params[key] = paramsObj[key];
                }
                delete params.func;
                request = new Ajax('/user/qryOSList8ReviewStatus.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.commentsData = data.re;
                        that.writeTable(data.re);
                        paramsObj.func(that.commentsPaginate, params.pageSize, params.pageNumber, data.re.totalPage);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            writeTable: function (data) {
                var html = "",
                    box = $('#comments-list'),
                    source = $('#service-list-template').html(),
                    template = Handlebars.compile(source);
                box.empty();
                if (data.totalRow) {
                    html = template(data);
                    $(html).appendTo(box);
                }
            }
    	};

    	var comments = new Comments();
    });
}(window.requirejs));