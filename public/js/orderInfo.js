(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', "formVerified", 'addrsCtrl', 'dial', 'chosen', 'glide' ], function ($, Ajax, common, dialog, info, Handlebars, FormVerified, addrsCtrl, dial) {
    	function OrderInfo () {
            this.orderno = common.getParams('orderno');
            this.orderData = null;
            this.init();
    	}

        OrderInfo.STATUSTXT = {
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

        OrderInfo.PHONETXT = {
            '0': "您的订单已提交成功，服务商将在20分钟内与您联系确认订单！如有疑问，请点此",
            '5': "您的订单已确认，请尽快付款！如有疑问，请点此",
            '10': "服务商已确认收款，将马上为您提供服务，请耐心等待！如有疑问，请点此",
            '11': "服务商已确认收款，将马上为您提供服务，请耐心等待！如有疑问，请点此",
            '15': "尚欠文稿",
            '20': "您的订单正在服务中！如有疑问，请点此",
            '30': "您的订单已完成，感谢您的信赖！如有疑问，请点此",
            '40': "您的订单已取消，欢迎再次购买！如有疑问，请点此",
            '42': "您的订单已取消，欢迎再次购买！如有疑问，请点此",
            '44': "您的订单已中止，给您造成不便，敬请见谅！如有疑问，请点此",
            '46': "您的订单已取消，欢迎再次购买！如有疑问，请点此",
            '48': "您的订单已取消，欢迎再次购买！如有疑问，请点此",
        };

    	OrderInfo.prototype = {
    		init: function () {
                this.listener();
    			this.queryOrderInfo();
    		},

            listener: function () {
                var that = this;
                $('#oi-btngroup').on('click', '[data-role="delBtn"]', function () {
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
                            that.queryOrderInfo();
                        } else {
                            common.errorDialog(data);
                        }
                    });
            },

            queryOrderInfo: function () {
                var that = this,
                    params = {
                        orderno: this.orderno
                    },
                    request = new Ajax('/user/qryNewOrderList.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.orderData = data.re.orderList[0].list[0];
                        that.fillPage();
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            fillPage: function () {
                this.fillheader();
                this.fillSteps();
                this.fillDetail();
                this.fillAmount();
            },

            fillheader: function () {
                var that = this,
                    group = $('oi-btngroup'),
                    html = [];
                $('#oi-no').html(this.orderData.orderno);
                $('#oi-status').html(OrderInfo.STATUSTXT[this.orderData.status]);
                $('#ri-contactText').html(OrderInfo.PHONETXT[this.orderData.status]);
                switch (this.orderData.status) {
                    case "0":
                        if (this.orderData.orderpayid) {
                            html.push('<a href="/app/cashier.html?ordernos=' + this.orderData.orderno + '&amp;amount=' + this.orderData.remainamount + '&amp;itemIds=' + this.orderData.orderpayid + '" class="btn btn-warning">付款</a>');
                        }
                        if (this.orderData.paid === "") {
                            html.push('<a data-role="cancelBtn" class="btn btn-link" data-value="' + this.orderData.orderno + '" href="javascript:;">取消订单</a>');    
                        }
                        break;
                    case "5":
                        if (this.orderData.orderpayid) {
                            html.push('<a href="/app/cashier.html?ordernos=' + this.orderData.orderno + '&amp;amount=' + this.orderData.remainamount + '&amp;itemIds=' + this.orderData.orderpayid + '" class="btn btn-warning">付款</a>');
                        }
                        if (this.orderData.paid === "") {
                            html.push('<a data-role="cancelBtn" class="btn btn-link" data-value="' + this.orderData.orderno + '" href="javascript:;">取消订单</a>');    
                        }
                        break;
                    case "10":
                        if (this.orderData.orderpayid) {
                            html.push('<a href="/app/cashier.html?ordernos=' + this.orderData.orderno + '&amp;amount=' + this.orderData.remainamount + '&amp;itemIds=' + this.orderData.orderpayid + '" class="btn btn-warning">付款</a>');
                        }
                        if (this.orderData.paid === "") {
                            html.push('<a data-role="cancelBtn" class="btn btn-link" data-value="' + this.orderData.orderno + '" href="javascript:;">取消订单</a>');    
                        }
                        break;
                    case "20":
                        if (this.orderData.orderpayid) {
                            html.push('<a href="/app/cashier.html?ordernos=' + this.orderData.orderno + '&amp;amount=' + this.orderData.remainamount + '&amp;itemIds=' + this.orderData.orderpayid + '" class="btn btn-warning">付款</a>');
                        }
                        if (this.orderData.paid === "") {
                            html.push('<a data-role="cancelBtn" class="btn btn-link" data-value="' + this.orderData.orderno + '" href="javascript:;">取消订单</a>');    
                        }
                        break;
                    case "30":break;
                }

                $('#oi-btngroup').empty().append(html.join(''));
                $('#ri-dial').attr('data-phone', this.orderData.srcontactstel);
                dial.refresh();
            },

            fillSteps: function () {
                var that = this,
                    step = $('#ri-steps'),
                    hasStep = false,
                    html = [];
                if (this.orderData.finished) {
                    html.push('<li><span>' + this.orderData.finished + '</span><em>订单完成</em></li>');
                    $('#ris-finished-time').html(this.orderData.finished);
                    if (!hasStep) {
                        step.removeClass().addClass("ri-steps-on03 clearfix");
                        hasStep = true;    
                    }
                }

                if (this.orderData.canceled) {
                    html.push('<li><span>' + this.orderData.canceled + '</span><em>您取消了订单</em></li>');
                    
                }

                if (this.orderData.stoped) {
                    html.push('<li><span>' + this.orderData.stoped + '</span><em>您中止了订单</em></li>');
                }

                if (this.orderData.osStarted) {
                    html.push('<li><span>' + this.orderData.osStarted + '</span><em>服务商启动服务</em></li>');
                    
                }

                if (this.orderData.paid) {
                    html.push('<li><span>' + this.orderData.paid + '</span><em>您的订单已付款，服务商确认收款后将启动服务</em></li>');
                }

                if (this.orderData.confirmed) {
                    html.push('<li><span>' + this.orderData.confirmed + '</span><em>您的订单已确认,请尽快付款</em></li>');
                    $('#ris-started-time').html(this.orderData.confirmed);
                    if (!hasStep) {
                        step.removeClass().addClass("ri-steps-on02 clearfix");
                        hasStep = true;    
                    }
                }

                if (this.orderData.created) {
                    html.push('<li><span>' + this.orderData.created + '</span><em>您提交了订单,请等待服务商确认</em></li>');
                    $('#ris-created-time').html(this.orderData.created);
                    if (!hasStep) {
                        step.removeClass().addClass("ri-steps-on01 clearfix");    
                    }
                }

                $('#ri-steps-detail').empty().append(html.join(''));
            },

            fillDetail: function () {
                var that = this;
                $('#oi-srname').html(this.orderData.srname).attr('href', "/servicer/getServicerDetail4V3Jsp.htm?servicerid=" + this.orderData.srid);
                $('#oi-srtel').html(this.orderData.srtel);
                $('#oi-srcontacts').html(this.orderData.srcontacts);
                $('#oi-srcontactstel').html(this.orderData.srcontactstel);
                $('#oi-contactsname').html(this.orderData.contactsname);
                $('#oi-contactsmobile').html(this.orderData.contactsmobile);
                $('#oi-address').html(this.orderData.address);
                this.fillTable();
            },

            fillTable: function () {
                var that = this,
                    i = 0,
                    j = 0,
                    iLen = 0,
                    jLen = 0,
                    html = "",
                    source = $('#list_template').html(),
                    template = Handlebars.compile(source),
                    items = this.orderData.serviceItemsList,
                    linkShow = this.orderData.confirmed !== "" ? true : false,
                    item = null,
                    list = $('#oi-serviceList'),
                    area = this.orderData.serviceVersion;
                for (i = 0, iLen = items.length; i < iLen; i += 1){
                    for(j = 0, jLen = items[i].length; j < jLen; j += 1) {
                        item = items[i][j];
                        if (item.serviceImgs !== "") {
                            item.serviceImg = item.serviceImgs.split(',')[0];
                        } else {
                            item.serviceImg = "/public/img/serviceCover_80x64.png";
                        }
                        item.area = area;
                        item.linkShow = linkShow;
                        item.orderno = this.orderData.orderno;
                    }
                }
                html = template(this.orderData);
                list.empty().append(html);
            },

            fillAmount: function () {
                var that = this,
                    i = 0,
                    length = 0,
                    html = "",
                    source = $('#amount_template').html(),
                    template = Handlebars.compile(source),
                    items = [],
                    type = [],
                    amount = $('#ri-amount'),
                    box = $('#orderInfo-detailBox');
                this.orderData.afterSave = (this.orderData.init*1 - this.orderData.saveamountall*1).toFixed(1);
                this.orderData.change = (Math.abs(this.orderData.init*1 - this.orderData.amount*1)).toFixed(1);
                if (Math.abs(this.orderData.init*1 - this.orderData.amount*1) !== 0) {
                    this.orderData.showChangeFlag = true;
                } else {
                    this.orderData.showChangeFlag = false;
                }
                this.orderData.changeFlag = this.orderData.init*1 > this.orderData.amount*1 ? '-' : '+'; 
                html = template(this.orderData);
                amount.empty().append(html);
                amount.on('mouseenter', '[data-role="toolTips"]', function () {
                    type = this.getAttribute('data-target');
                    /*html = [];
                    if (type === 'save') {
                        items = that.orderData.modifyAmountList;
                        html.push('<h4>下单后价格调整</h4>');
                    } else if (type === 'refund') {
                        items = that.orderData.refundList;
                        html.push('<h4>退款</h4>');
                    }
                    html.push('<ul>');
                    for (i = 0, length = items.length; i < length; i += 1) {
                        html.push('<li' + (i === length - 1 ? ' class="last-child"' : '') + '>');
                        html.push('<i class="icon"></i>');
                        html.push('<em>' + items[i].reason + '</em>');
                        html.push('<span>' + items[i].created + '</span>');
                        html.push('</li>');
                    }
                    html.push('<ul>');
                    box.empty().append(html.join(''));*/
                    box.css({
                        top: $(this).offset().top,
                        left: $(this).offset().left - 422 - 20,
                        display: 'block'
                    });
                }).on('mouseleave', '[data-role="toolTips"]', function () {
                    box.hide();
                });
            }
    	};

    	var orderInfo = new OrderInfo();
    });
}(window.requirejs));