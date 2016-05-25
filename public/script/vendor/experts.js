(function (define) {
    'use strict';
    define(['dummy', 'jquery', 'info', 'placeholder'], function (dummy, $, info) {
        function Experts(element, options) {
            this.$element = element;
            this.options = $.extend({}, Experts.DEFAULTS, options);
            this.packageList();
        }
        
        Experts.DEFAULTS = {
            effective: ['10001', '10002', '10005']
        };
        
        Experts.prototype = {
            telphoneReg: /(^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$)|(^(\d{0,4}\-)?\d{8}$)/,
            callParams: {},
            init: function () {
                
            },
            packageList: function () {
                var i = 0,
                    j = 0,
                    length = this.options.effective.length,
                    eLen = dummy.experts.length,
                    items = [],
                    item = null,
                    html = [];
                for (i = 0; i < length; i += 1) {
                    for (j = 0; j < eLen; j += 1) {
                        if ( this.options.effective[i] === dummy.experts[j].id) {
                            items.push(dummy.experts[j]);
                        }
                    }
                }
                this.$element.empty();
                for (i = 0, length = items.length; i < length; i += 1) {
                    item = items[i];
                    html.push('<li>');
                    html.push('<h4>');
                    html.push('<a href="javascript:;" data-role="detialBtn" data-value="' + item.id + '">' + item.name + '</a>');
                    html.push('</h4>');
                    html.push('<p>');
                    html.push('<span>');
                    html.push('<a href="javascript:;" data-role="detialBtn" data-value="' + item.id + '">');
                    html.push('<img src="' + item.thumbImage + '" width="86" height="110" />');
                    html.push('</a>');
                    html.push('<a href="javascript:;" class="btn btn_info" data-role="dialBtn" data-value="' + item.id + '">立即咨询</a>');
                    html.push('</span>');
                    html.push(item.intro);
                    html.push('</p>');
                    
                    html.push('</li>');
                }
                this.$element.append(html.join(''));
                this.addBtnAction();
            },
            
            addBtnAction: function () {
                var that = this;
                this.$element
                    .on('click', '[data-role="detialBtn"]', function () {
                        that.showDetailBox(this.getAttribute('data-value'));
                    })
                    .on('click', '[data-role="dialBtn"]', function () {
                        info.close();
                        that.showDialBox(this.getAttribute('data-value'));
                    });
            },
            
            showDetailBox: function (id) {
                var that = this,
                    i = 0,
                    length = dummy.experts.length,
                    item = null,
                    html = [];
                for (i = 0; i < length; i += 1) {
                    if (id === dummy.experts[i].id) {
                        item = dummy.experts[i];
                    }
                }
                html.push('<div class="export_detail_box" id="export_detail_box">');
                html.push('<div class="edb_leftside">');
                html.push('<img src="' + item.image + '" width="230" height="295" />');
                html.push('<a href="javascript:;" id="edb_dialBtn"  data-value="' + item.id + '" class="btn btn_info">立即咨询</a>');
                html.push('</div>');
                html.push('<div class="edb_rightside">');
                html.push('<h4>' + item.name + '</h4>');
                html.push('<p>' + item.intro + '</p>');
                html.push('</div>');
                html.push('</div>');
                
                info.show({
                    content: html.join('')
                });
                
                $('#edb_dialBtn').on('click', function () {
                    info.close();
                    that.showDialBox();
                });
            },
            
            showDialBox: function (id) {
                var that = this,
                    i = 0,
                    phoneText = null,
                    length = dummy.experts.length,
                    masterCallPhoneNo = "",
                    html = [];
                for (i = 0; i < length; i += 1) {
                    if (id === dummy.experts[i].id) {
                        masterCallPhoneNo = dummy.experts[i].phone;
                    }
                }
                html.push('<div class="phone_box" id="dial_box">');
                html.push('<p class="mb_btnline">');
                html.push('<input type="tel" class="mb_text" name="phone" id="dial_phone" placeholder="请输入您的手机或固话号码" maxlength="15">');
                html.push('<a href="javascript:;" id="dial_btn" class="btn btn_warning">立即免费通话</a>');
                html.push('<p>壹财税将免费拨打您与服务商电话，请稍后接听4008-310-866，并耐心等待服务商接听</p>');
                html.push('</div>');
                info.show({
                    content: html.join('')
                });
                
                phoneText = $('#dial_phone');
                
                phoneText.placeholder().on('keyup', function (event) {
                    var code = event.keyCode;
                    if (!that.telphoneReg.test(this.value)) {
                        phoneText.addClass('invalid');
                        phoneText.removeClass('valid');
                    } else {
                        phoneText.addClass('valid');
                        phoneText.removeClass('invalid');
                        if (code === 13) {
                            info.close();
                            that.dialPhone(masterCallPhoneNo, this.value);
                        }
                    }
                });
                
                $('#dial_btn').on('click', function () {
                    if (!that.telphoneReg.test(phoneText.val())) {
                        phoneText.addClass('invalid');
                    } else {
                        info.close();
                        that.dialPhone(masterCallPhoneNo, phoneText.val());
                    }
                    
                });
            },
            
            dialPhone: function (masterCallPhoneNo, slaveCallPhoneNo) {
                var that = this,
                    params = {
                        masterCallPhoneNo: slaveCallPhoneNo,
                        slaveCallPhoneNo: masterCallPhoneNo
                    };
                $.ajax({
                    url:  "/common/requestBinCall4Specialist.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        if (data.status === "200") {
                            that.callParams = data.re;
                            that.showOnCallBox();
                            that.queryCallStatus();
                        }
                    },
                    error: function (data) {

                    }

                });
                
            },
            
            queryCallStatus: function () {
                var that = this,
                    poll = function () {
                        $.ajax({
                            url: "/common/qryBinCallStatus.htm",
                            data: that.callParams,
                            dataType: "json",
                            type: "POST",
                            xhrFields: {
                                withCredentials: true
                            },
                            success: function (data) {
                                if (data.status === "200") {
                                    if (data.re.isCallFinish === "0") {
                                        setTimeout(poll, 5000);
                                    } else {
                                        info.close();
                                    }
                                } else {
                                    info.close();
                                }
                            },
                            error: function (data) {

                            }

                        });
                    };
                poll();
                
            },
            
            showOnCallBox: function () {
                var html = [];
                html.push('<p class="onCall_box">');
                html.push('<i class="icon"></i> ');
                html.push('电话接通中……');
                html.push('</p>');
                info.show({
                    content: html.join('')
                });
            }
        };
        
        return Experts;
        
    });
}(window.define));