(function (requirejs) {
    'use strict'; 

    requirejs(['jquery', 'ajax', 'common', 'handlebars', 'chosen', 'dialog', 'info', 'formVerified', 'dial', 'placeholder'], function ($, Ajax, common, Handlebars, chosen, dialog, info, FormVerified, dial) {
        function expertHome () {
            this.messageId = "";
            this.$messageBox = $('#message-dialog .message-popover');
            this.init();
        }

        expertHome.prototype = {
            init: function () {
                var that = this,
                    servicerVt = new FormVerified(document.getElementById('consultForm'), function () {
                        that.addPurpose();
                    });
                $("select").chosen();
                this.registerHHelper();
                this.listener();
            },

            listener: function () {
                var that = this;

                // Hot Experts
                $('.experts-wrapper .expert').on({
                    mouseover: function(){
                        $(this).addClass('active');
                        $(this).parents('.experts-wrapper').addClass('hovering');
                    },
                    mouseleave: function(){
                        $(this).removeClass('active');
                        $(this).parents('.experts-wrapper').removeClass('hovering');
                    }
                });

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
                        sourcetype: "50",   //10-首页“帮我找服务商”；20-服务页“留言咨询”；30-服务商列表页“推荐服务商”；40-服务商店铺；50-专家页；60-资讯页“专业财税顾问”；70-最近热搜页；80-最热资讯页；90-帮助中心
                        title: $.trim(form.title.value),
                        tel: form.tel.value,
                        comments: $.trim(form.comments.value),
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
                            $('#consultForm').find('.valid,.invalid').removeClass('valid invalid');
                            $('#consultForm').find('input,textarea').val("");
                            $('#your_needs_select').val('-1').trigger('chosen:update');
                            messageVt = new FormVerified(document.getElementById('message-form'), function () {
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
            }


        };

        var experthome = new expertHome();

    });

}(window.requirejs));