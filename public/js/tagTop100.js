(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'addrsCtrl', 'dialog', 'info', 'formVerified', 'carousel', 'chosen', 'placeholder'], function ($, Ajax, common, addrsCtrl, dialog, info, FormVerified) {
        function TagTop(){
            this.$messageBox = $('#message-dialog .message-popover');
            this.init();
        }

        TagTop.prototype = {
            init: function () {
                var that = this,
                    servicerVt = new FormVerified(document.getElementById("consultForm"), function() {
                        that.addPurpose();
                    }, false);
                $('#ng-carousel').carousel({
                    needInd: false,
                    autoPlay: false
                });
                $('select').chosen();
                this.selectAction();
            },

            editPurpose: function () {
                var that = this,
                    form = document.forms.messageForm,
                    params = {
                        id: this.messageId,
                        qq: form.qq.value,
                        wechat: form.wechat.value
                    },
                    request = new Ajax('/servicer/editPurpose.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                            info.close();
                            dialog.show({
                                content: "提交成功"
                            });
                        } else {
                            info.close();
                            common.errorDialog(data);
                        }
                });
            },

            addPurpose: function () {
                var that = this,
                    messageVt = null,
                    form = document.forms.consultForm,
                    params = {
                        sourcetype: "70",   //10-首页“帮我找服务商”；20-服务页“留言咨询”；30-服务商列表页“推荐服务商”；40-服务商店铺；50-专家页；60-资讯页“专业财税顾问”；70-最近热搜页；80-最热资讯页；90-帮助中心
                        title: $.trim(form.title.value),
                        tel: form.tel.value,
                        province: form.province.value,
                        city: form.city.value,
                        district: form.district.value,
                        sdcat1: form.sdcat1.value 
                    },
                    request = new Ajax('/servicer/addPurpose.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                            that.messageId = data.re.id;
                            info.show({
                                content: that.$messageBox
                            });
                            $(document.forms.messageForm).find('input').removeClass('invalid valid').val("");
                            $('#message-form input[type="text"]').placeholder();
                            messageVt = new FormVerified(document.forms.messageForm, function () {
                                that.editPurpose();
                            });
                            messageVt.checkQQ = function (value, notRequire) {
                                if (this.checkDirty(value, notRequire)) {
                                    return this.messageInfo.dirty;
                                } else if (!value) {
                                    return "";
                                }
                                if (!/^\d{5,20}$/.test(value)) {
                                    return "请输入正确的QQ号";
                                }
                                return "";
                            };
                            messageVt.checkWechat = function (value, notRequire) {
                                if (this.checkDirty(value, notRequire)) {
                                    return this.messageInfo.dirty;
                                } else if (!value) {
                                    return "";
                                }
                                if (/^\s+$/.test(value) || !/^[\s\S]{5,20}$/.test(value)) {
                                    return "请输入正确的微信号";
                                }
                                return "";
                            };
                        } else {
                            common.errorDialog(data);
                        }
                });
            },

            selectAction: function () {
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('spb-province'), selected: "440000"});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('spb-city'), value: "440000", selected: "440100", isCity: true});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('spb-district'), value: "440100", selected: "440106", isCity: false});
                $('#spb-province').change(function () {
                    addrsCtrl.addressSelectAction({
                        selectObj: document.getElementById('spb-city'),
                        value: this.value,
                        resetObj: document.getElementById('spb-district'),
                        isCity: true
                    });
                });
                $('#spb-city').change(function () {
                    addrsCtrl.addressSelectAction({
                        selectObj: document.getElementById('spb-district'),
                        value: this.value,
                        isCity: false
                    });
                });
            }
        };

        var tagTop = new TagTop();
    });
}(window.requirejs));