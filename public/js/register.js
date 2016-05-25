(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', "formVerified", 'dialog', 'info', 'handlebars', 'choice'], function ($, Ajax, common, FormVerified, dialog, info, Handlebars) {
    	function Register () {
            this.onCountDown = false;
            this.onChecking = false;
    		this.init();
    	}

        Register.COUPONNAME = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        Register.COUPONCLASS = {
            "0": "",
            "1": "coupon-blue",
            "2": "coupon-orange",
            "3": "coupon-green"
        };

    	Register.prototype = {
    		init: function () {
                var that = this,
                    phone = $('#rb_phone'),
                    formVerified = new FormVerified(document.getElementById("register_form"), function () {
                        that.registerPass();
                    }, true);
    			$('input[type="checkbox"]').choice();
    			formVerified.checkAccount = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(value)) {
                        return "请输入4-20位字母、数字或“-”、“_”字符";
                    }
                    return "";
                };

                formVerified.checkPassword = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^\S{6,20}$/.test(value)){
                        return "请输入6-20位非空格字符";
                    }
                    return "";
                };

                formVerified.checkPhoneCode = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (value.length !== 4) {
                        return "验证码错误";
                    }
                    return "";
                };

                phone.on('keyup', function () {
                    var error = null;
                    if (this.getAttribute('data-error-target')) {
                        error = $('#' + this.getAttribute('data-error-target'));
                        if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test($('#rb_phone').val())){
                            $(this).addClass('invalid').removeClass('valid');
                            error.show();
                        } else {
                            $(this).removeClass('invalid').addClass('valid');
                            error.hide();
                        }
                    }
                });
                
                $('#rb_getPhoneCodeBtn').on('click', function () {
                    var error = null,
                        area = document.getElementById('rb_phone'),
                        id = area.getAttribute('data-error-target');
                    if (!id) {
                        id = 'e' + parseInt(Math.random()*1e16, 10);
                        area.setAttribute('data-error-target', id);
                    }
                    if (!document.getElementById(id)) {
                        error = $('<span class="error" id="' + id + '" style="display:none;"></span>');
                        $(area).parent().append(error);
                    } else {
                        error = $('#' + id);
                    }
                    if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test($('#rb_phone').val())){
                        $(area).addClass('invalid').removeClass('valid');
                        error.html("请输入正确的手机号码").show();
                        return;
                    }

                    if (!that.onCountDown) {
                        that.getPhoneCode();
                    }

                    $(area).removeClass('invalid').addClass('valid');
                    error.hide();
                });
                this.registerHHelper();
    			this.listener();
                this.changeImageCode();
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

            startCountDown: function () {
                var that = this,
                    btn = $('#rb_getPhoneCodeBtn'),
                    i = 60,
                    countDown = function () {
                        i -= 1;
                        if (i <= 0) {
                            that.onCountDown = false;
                            btn.html('获取手机验证码');
                        } else {
                            btn.html('<em>' + i + '</em>秒后可重新获取');
                            setTimeout(countDown, 1000);
                        }
                    };
                this.onCountDown = true;
                countDown();
            },

            changeImageCode: function () {
                $('#rb-imgCode').attr('src',  "/vc.htm?time=" + new Date().getTime());
            },

    		listener: function () {
    			var that = this;
                $('#rb-imgCode').on('click', $.proxy(this.changeImageCode, this));
                $('#rb-changeImgCode').on('click', $.proxy(this.changeImageCode, this));
    		},

            registerPass: function () {
                var that = this,
                    form = document.forms.registerForm,
                    params = {
                        username: form.username.value,
                        password: form.password.value,
                        confirmpassword: form.confirmpassword.value,
                        mobile: form.mobile.value,
                        validatecode: form.validatecode.value
                    },
                    request = new Ajax ('/user/registuser.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.queryCouponList();
                    } else {
                        dialog.show({
                            content: data.errormsg
                        });
                    }
                });
            },
            
            getPhoneCode: function (validateCode) {
                var that = this,
                    form = document.forms.registerForm,
                    params = {
                        phoneNo: form.mobile.value,
                        validateCodeImg: form.validateCodeImg.value
                    },
                    request = new Ajax('/common/sendValidateCode.htm', params);
                request.done(function (data) {
                    if (data.status === "200"){
                            that.startCountDown();
                        } else if (data.status === "-100") {
                            dialog.show({
                                content: data.errormsg
                            });
                        }
                });
            },

            queryCouponList: function () {
                var that = this,
                    request = new Ajax('/user/qryMyCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.area.length || data.re.servicer.length) {
                            that.writeCouponList(data.re);
                        } else {
                            that.regiterSuccess();
                        }
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            writeCouponList: function (data) {
                var that = this,
                    html = "",
                    ids = "",
                    couponName = "",
                    i = 0,
                    length = 0,
                    items = [],
                    item = null,
                    source = $('#findcoupon_template').html(),
                    template = Handlebars.compile(source),
                    addParams = function () {
                        couponName = "";
                        if (item.type === 10) {
                            couponName += "全站通用";
                        } else if (item.type === 20) {
                            if (item.servicerSize !== 1) {
                                couponName += "限定店铺";
                            } else if (item.servicerSize === 1) {
                                couponName += item.servicerList[0].nickname;
                            }
                        }

                        if (item.implement === 10) {
                            couponName += "优惠卡";
                        } else if (item.implement === 20) {
                            couponName += "优惠券";
                        } else {
                            couponName += "赠券";
                        }
                        item.couponName = couponName;
                        if (item.couponType === "折扣") {
                            item.couponClass = "coupon-blue";
                        } else if (item.couponType === "直减") {
                            item.couponClass = "coupon-orange";
                        } else if (item.couponType === "一口价") {
                            item.couponClass = "coupon-green";
                        }
                    };
                for(i = 0, length = data.area.length; i < length; i += 1) {
                    items.push(data.area[i]);
                }

                for(i = 0, length = data.servicer.length; i < length; i += 1) {
                    items.push(data.servicer[i]);
                }
                
                for (i = 0, length = items.length; i < length; i += 1) {
                    item = items[i];
                    addParams();
                }
                html = template(items);
                info.show({
                    content: html,
                    closeAction: function () {
                        that.regiterSuccess();
                    }
                });
            },

            regiterSuccess: function () {
                var number = 5,
                    countDown = function () {
                        if (number === 0) {
                            $('#rs-number').html(number);
                            if ($.cookie('backPage')) {
                                window.location.href = $.cookie('backPage');
                            } else {
                                window.location.href = "/";
                            }
                        } else if (number > 0){
                            $('#rs-number').html(number);
                            setTimeout(function () {
                                number -= 1;
                                countDown();
                            }, 1000);
                        }
                        
                    };
                $('#register-form').hide();
                $('#register-success').show();
                countDown();
            }
    	};

    	var register = new Register();
    });
}(window.requirejs));