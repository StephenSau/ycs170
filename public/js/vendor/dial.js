define(["jquery", "ajax", "dialog", "info"], function ($, Ajax, dialog, info) {
    function Dail () {
        this.callParams = {};
        this.slaveCallPhoneNo = "";
        this.masterCallPhoneNo = "";
        this.init();
    }

    Dail.REG = /(^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$)|(^(\d{0,4}\-)?\d{8}$)/;

    Dail.prototype = {
        init: function () {
            this.listener();
        },

        refresh: function () {
            this.listener();
        },


        listener: function () {
            var that = this,
                dailAction = function () {
                    that.slaveCallPhoneNo = $(this).attr('data-phone');
                    that.showDailForm();
                };
            $('[data-spy="dial"]')
                .unbind('click', dailAction)
                .bind('click', dailAction);
        },

        showDailForm: function() {
            var that = this,
                form = null,
                phoneText = null,
                html = [];
            html.push('<div class="connect-popover">');
            html.push('<ul class="olbb-step">');
            html.push('<li>输入手机号码</li>');
            html.push('<li>接听壹财税客服电话</li>');
            html.push('<li>接通服务商</li>');
            html.push('</ul>');
            html.push('<div class="connect-telForm">');
            html.push('<form name="telForm" id="telForm">');
            html.push('<input type="text" id="connect-Phone" name="phone" maxlength="11" />');
            html.push('<button type="submit" name="submit" class="btn">免费</button');
            html.push('</form>');
            html.push('</div>');
            html.push('</div>');

            info.show({
                content: html.join('')
            });

            form = document.forms.telForm;

            phoneText = $(form.phone);

            phoneText.on('keyup', function (event) {
                var code = event.keyCode;
                if (!Dail.REG.test(this.value)) {
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

            $(form).on('submit', function (event) {
                event.preventDefault();
                if (!Dail.REG.test(phoneText.val())) {
                    phoneText.addClass('invalid');
                } else {
                    info.close();
                    that.dialPhone(phoneText.val());
                }
            });

        },

        dialPhone: function (masterCallPhoneNo) {
            var that = this,
                params = {
                    masterCallPhoneNo: masterCallPhoneNo,
                    slaveCallPhoneNo: this.slaveCallPhoneNo
                },
                request = new Ajax('/common/requestBinCall4Specialist.htm', params);
            request.done(function (data) {
                if (data.status === "200") {
                    that.callParams = data.re;
                    that.showOnCallBox();
                    that.queryCallStatus();
                } else {
                    dialog.show({
                        content: data.errormsg
                    });
                }
            });  
        },

        queryCallStatus: function () {
            var that = this,
                poll = function () {
                    var request = new Ajax('/common/qryBinCallStatus.htm', that.callParams);
                    request.done(function (data) {
                        if (data.status === "200") {
                            if (data.re.isCallFinish === "0") {
                                setTimeout(poll, 5000);
                            } else {
                                info.close();
                            }
                        } else {
                            info.close();
                        }
                    });
                };
            poll();
        },

        showOnCallBox: function () {
            var html = [];
            html.push('<div class="connecting-popover">');
            html.push('<h2>电话接通中...</h2>');
            html.push('<p>请接听壹财税客服电话：400-310-866，并耐心等待服务商接听</p>');
            html.push('</div>');
            info.show({
                content: html.join('')
            });
        }

    };

    return new Dail();    
});