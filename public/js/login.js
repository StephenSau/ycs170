(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', "formVerified", 'handlebars', 'dialog', 'info', 'choice', 'placeholder'], function ($, Ajax, common, FormVerified, Handlebars, dialog, info) {
    	function Login () {
            this.onImgCode = false;
            this.telphone = "";
            this.id = "";
            this.thirdType = "";
            this.formStatus = "common";
            this.onCountDown = false;
    		this.init();
    	}

        Login.TIMEFLAG = null;

    	Login.prototype = {
    		init: function () {
    			$('input[type="checkbox"]').choice();
                this.getAccountName();
    			this.listener();
                if ($.cookie('code') && 
                    $.cookie('state') &&
                    common.getParams('code') && 
                    common.getParams('state') &&
                    $.cookie('code') === common.getParams('code') &&
                    $.cookie('state') === common.getParams('state')) {
                    window.location.href = $.cookie('backPage');
                    setTimeout(function () {
                        window.location.href = "/";
                    }, 1000);
                }
                if (common.getParams('code') && common.getParams('state')) {
                    this.loginByThirdParty(common.getParams('code'), common.getParams('state'));
                }
    		},

    		listener: function () {
    			var that = this,
                    loginForm = document.forms.loginForm,
                    phoneForm = document.forms.phoneForm,
                    codeForm = document.forms.codeForm,
                    phone = $('#pf-phoneNo');
    			$('#lb_wxLogin').on('click', function () {
                    that.showWXlogin();
                });
                $(loginForm).on('submit', function (event) {
                    event.preventDefault();
                    that.loginPass();
                });

                $(phoneForm).on('submit', function (event) {
                    event.preventDefault();
                    that.loginByPhone();
                });

                $(codeForm).on('submit', function (event) {
                    event.preventDefault();
                    that.getPhoneCode('phoneForm', document.getElementById('cf-authCodeImg').value);
                });

                phone.on('keyup', function () {
                    if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(phone.val())){
                        $(this).addClass('invalid').removeClass('valid');
                    } else {
                        $(this).removeClass('invalid').addClass('valid');
                    }
                });

                $('#cf-changeCodeBtn').on('click', function () {
                    that.changeImgCode();
                });

                $('#pf-getPhoneCode').on('click', function () {
                    if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(phone.val())){
                        dialog.show({
                            content: "请填写正确手机号码"
                        });
                        return;
                    }
                    if (!that.onCountDown) {
                        that.getPhoneCode('phoneForm');
                    }
                });

                $('#login-tab').on('click', 'li', function () {
                    $(this).addClass('active').siblings('li').removeClass('active');
                    that.changeBox($(this).attr('data-target'));
                });
    		},

            getAccountName: function () {
                var accountName = $.cookie('accountname'),
                    userTelphone = $.cookie('usertelphone');
                if (accountName) {
                    document.forms.loginForm.user.value = accountName;
                }
                if (userTelphone) {
                    document.forms.phoneForm.phoneNo.value = userTelphone;
                }
                $('.form-text').placeholder();
            },

            getPhoneCode: function (formName, validateCode) {
                var that = this,
                    tips = $('#ui-register-tips'),
                    form = document.forms[formName],
                    params = {
                        phoneNo: form.phoneNo.value
                    },
                    request = null;
                if (validateCode) {
                    params.authCodeImg = validateCode;
                }

                request = new Ajax('/user/sendAuthCode4Login.htm', params);
                request.done(function (data) {
                    if (data.status === "200"){
                        that.changeBox(formName === "phoneForm" ? "phone-form" : "register_form");
                        that.startCountDown(formName);
                    } else if (data.status === "-100") {
                        if (data.errorcode === "2084") {
                            that.changeBox(formName === "phoneForm" ? "code-form" : "imagecode_form");
                        } else if (data.errorcode === "2048" && formName === "registerForm") {
                            $('#rb-imgCodeText').val("").focus().addClass('invalid');
                        } else {
                            if (formName === "registerForm"){
                                tips.html(data.errormsg).show().delay(1500).slideUp(800);
                            } else {
                                common.errorDialog(data);
                            }
                            
                        }
                    }
                });
            },

            startCountDown: function (formName) {
                var that = this,
                    btn = formName === "phoneForm" ? $('#pf-getPhoneCode') : $('#rb_getPhoneCodeBtn'),
                    i = 60,
                    countDown = function () {
                        i -= 1;
                        if (i <= 0) {
                            that.onCountDown = false;
                            btn.html('获取验证码');
                        } else {
                            btn.html('<em>' + i + '</em>秒后可获取');
                            Login.TIMEFLAG = setTimeout(countDown, 1000);
                        }
                    };
                this.onCountDown = true;
                clearTimeout(Login.TIMEFLAG);
                countDown();
            },

            changeImgCode: function (target) {
                $('#' + target + '-imgCode').attr('src', "/vc.htm?time=" + new Date().getTime());
            },

            changeBox: function (id) {
                if (id === "common-form" || id === "code-form" ||id === "phone-form") {
                    $('#common-form').removeClass('active');
                    $('#code-form').removeClass('active');
                    $('#phone-form').removeClass('active');
                }
                $('#register_form').removeClass('active');
                $('#imagecode_form').removeClass('active');
                $('#' + id).addClass('active');
                if (id === "code-form") {
                    $('#cf-authCodeImg').val("");
                    this.changeImgCode('cf');
                }
                if (id === "imagecode_form") {
                    $('#rb-imgCodeText').val("").removeClass('invalid valid');
                    this.changeImgCode('rb');
                }

                if (id === "imagecode_form" || id === "register_form") {
                    $('#ui-register-tips').hide();
                }
                
            },

            loginPass: function () {
                var that = this,
                    form  = document.forms.loginForm,
                    params = {
                            username: form.user.value,
                            password: form.password.value
                        },
                    request = new Ajax("/user/login.htm", params);
                if (!form.user.value) {
                    dialog.show({
                        content: "请填写用户名"
                    });
                    return;
                } else if (!form.password.value) {
                    dialog.show({
                        content: "请输入密码"
                    });
                    return;
                }
                request.done(function (data) {
                    if (data.status === "200") {
                        if (form.remember.checked) {
                            $.cookie('accountname', form.user.value, {expires: 7, path: '/'});
                        } else {
                            $.removeCookie('accountname', {path: '/'});
                        }
                        window.location.href = $.cookie('backPage');
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1000);
                    } else {
                        common.errorDialog(data);
                        $(form.user).removeClass('invalid');
                        $(form.password).removeClass('invalid');
                        if (data.errorcode === "3001") {
                            $(form.user)
                                .addClass('invalid');
                        } else if (data.errorcode === "3119") {
                            $(form.password)
                                .addClass('invalid');
                        } else if (data.errorcode === "3020") {
                            if (!form.user.value) {
                                $(form.user)
                                    .addClass('invalid');
                            } else if (!form.password.value) {
                                $(form.password)
                                    .addClass('invalid');
                            }
                        }
                    }
                });
            },

            loginByPhone: function () {
                var that = this,
                    form = document.forms.phoneForm,
                    params = {
                        phoneNo: form.phoneNo.value,
                        authCode: form.authCode.value
                    },
                    request = null;
                if (!form.phoneNo.value) {
                    dialog.show({
                        content: "请填写手机"
                    });
                    return;
                } else if (!form.authCode.value) {
                    dialog.show({
                        content: "请输入验证码"
                    });
                    return;
                }

                request = new Ajax('/user/loginByPhone.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (form.remember.checked) {
                            $.cookie('usertelphone', form.phoneNo.value, {expires: 7, path: '/'});
                        } else {
                            $.removeCookie('usertelphone', {path: '/'});
                        }

                        if (data.re.needSetPwd) {
                            that.telphone = form.phoneNo.value;
                            data.re.mobile = form.phoneNo.value;
                            that.packageSupplement(data.re);
                        } else {
                            window.location.href = $.cookie('backPage');
                            setTimeout(function () {
                                window.location.href = "/";
                            }, 1000);
                        }
                    } else {
                        common.errorDialog(data);
                        $(form.phoneNo).removeClass('invalid');
                        $(form.authCode).removeClass('invalid');
                    }
                });
            },

            packageSupplement: function (data) {
                var that = this,
                    source = $('#supplement-template').html(),
                    template = Handlebars.compile(source),
                    html = template(data);
                info.show({
                    content: html,
                    closeAction: function () {
                        window.location.href = $.cookie('backPage');
                    }
                });
                $('#sf_username').placeholder();
                $('#sf_password').placeholder();

                $('#supplementForm').on('submit', function (event) {
                    event.preventDefault();
                    that.supplementSubmit();
                });

                $('#sf_showForm').on('click', function (event) {
                    $('#sf_form').show();
                    $(this).hide();
                });
            },


            supplementSubmit: function () {
                var that = this,
                    form = document.forms.supplementForm,
                    tips = $('#ui-supplement-tips'),
                    params = {
                        username: form.username.value,
                        password: form.password.value
                    },
                    request = null;
                $(form.username).removeClass('invalid');
                $(form.password).removeClass('invalid');
                if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(form.username.value)) {
                    tips.html('用户名错误，请输入4-20位字母、数字或“-”、“_”字符').show();
                    $(form.username).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (/^\d+$/.test(form.username.value)) {
                    tips.html('对不起，您输入的用户名不能为纯数字').show();
                    $(form.username).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (!/^\S{6,20}$/.test(form.password.value)) {
                    tips.html('请输入6-20位非空格字符').show();
                    $(form.password).css({
                        'border-color': '#db281f'
                    });
                    return;
                }

                request = new Ajax('/user/setIDAndPwd.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        info.close();
                        window.location.href = $.cookie('backPage');
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1000);
                    } else {
                        $(form.username).removeAttr('style');
                        $(form.password).removeAttr('style');
                        tips.html(data.errormsg).show();   
                    }
                });  
            },

    		showWXlogin: function () {
                var obj = null,
                    source = $('#wxLoginBox-template').html(),
                    template = Handlebars.compile(source),
                    html = template({});
                info.show({
                    content: html
                });
                obj = new WxLogin({
                    id: "wxLoginBox",
                    appid: "wx3d09fbc212f8fa1e",
                    scope: "snsapi_login",
                    redirect_uri: "http://www.1caishui.com/app/login.html",
                    state: "THIRD_PARTY_1CAISHUI_WEIXIN_LOGIN",
                    style: "black",
                    href: ""
                });
            },

            showLoading: function () {
                var source = $('#loadingBox-template').html(),
                    template = Handlebars.compile(source),
                    html = template({});
                info.show({
                    content: html
                });
            },

            loginByThirdParty: function (code, state) {
                var that = this,
                    params = {
                        code: code,
                        state: state
                    },
                    request = null;
                $.cookie('code', code, {expires: 1, path: '/'});
                $.cookie('state', state, {expires: 1, path: '/'});
                this.thirdType = state === "THIRD_PARTY_1CAISHUI_WEIXIN_LOGIN" ? "THIRD_PARTY_1CAISHUI_WEIXIN_LOGIN" : "THIRD_PARTY_1CAISHUI_QQ_LOGIN";
                that.showLoading();
                request = new Ajax("/user/loginByThirdParty.htm", params);
                request.done(function (data) {
                	if (data.status === "200") {
                        info.close();
                        if (data.re.needBond) {
                            that.id = data.re.id;
                            that.showBindingBox(data.re.nickname);
                        } else {
                            window.location.href = $.cookie('backPage');
                            setTimeout(function () {
                                window.location.href = "/";
                            }, 1000);
                        }
                    } else {
                        info.close();
                        common.errorDialog(data);
                    }
                });
            },

            showBindingBox: function (nickname) {
                var that = this,
                    formVerified = null,
                    isWx = this.thirdType === "THIRD_PARTY_1CAISHUI_WEIXIN_LOGIN",
                    source = $('#binddingbox-template').html(),
                    template = Handlebars.compile(source),
                    html = template({
                        type: isWx ? "微信" : "QQ",
                        title: isWx ? "只差一步，即可完成登录设置" : "登录成功，请完善您的账号信息",
                        nickname: nickname
                    });
                info.show({
                    content: html,
                    closeAction: function () {
                        window.location.href = $.cookie('backPage');
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1000);
                    }
                });
                
                $('#rb_agree').choice();
                $('#bb-username').placeholder();
                $('#bb-password').placeholder();
                formVerified = new FormVerified(document.forms.registerForm, function () {
                    that.registerPass();
                }, true);
                formVerified.checkUser = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(value)){
                        return "4-20位字母数字或“-”“_”字符";
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

                this.bindingListener();  
            },

            bindingListener: function () {
                var that = this,
                    phone = $('#rb_phone');
                $(document.forms.bindingForm).on('submit', function (event) {
                    event.preventDefault();
                    that.wxLoginPass();
                });
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
                        that.getPhoneCode('registerForm');
                    }

                    $(area).removeClass('invalid').addClass('valid');
                    error.hide();
                });
                

                $('#rb-imgCode').on('click', function () {
                    that.changeImgCode('rb');
                });

                $('#rb-changeImgCode').on('click', function () {
                    that.changeImgCode('rb');
                });

                $(document.forms.imagecodeForm).on('submit', function (event) {
                    event.preventDefault();
                    that.getPhoneCode('registerForm', $('#rb-imgCodeText').val());
                });
                $('#rb_telCode').on('click', function (){
                    if (this.value.length === 4) {
                        $(this).removeClass('invalid').addClass('valid');
                    }
                }); 
            },

            registerPass: function () {
                var that = this,
                    form = document.forms.registerForm,
                    tips = $('#ui-register-tips'),
                    params = {
                        id: this.id,
                        loginType: this.thirdType,
                        username: form.username.value,
                        password: form.password.value,
                        mobile: form.phoneNo.value,
                        authCode: form.telCode.value
                    },
                    request = new Ajax('/user/regAfter3PLogin.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        window.location.href = $.cookie('backPage');
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1000);
                    } else {
                        tips.html(data.errormsg).show().delay(1500).slideUp(800);
                    }
                });
            },

            wxLoginPass: function () {
                var form = document.forms.bindingForm,
                    params = {
                        id: this.id,
                        loginType: this.thirdType,
                        username: form.username.value,
                        password: form.password.value
                    },
                    tips = $('#ui-binding-tips'),
                    request = null;
                if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(form.username.value)) {
                    tips.html('用户名错误，请输入4-20位字母、数字或“-”、“_”字符').show();
                    $(form.username).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (/^\d+$/.test(form.username.value)) {
                    tips.html('对不起，您输入的用户名不能为纯数字').show();
                    $(form.username).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (!/^\S{6,20}$/.test(form.password.value)) {
                    tips.html('请输入6-20位非空格字符').show();
                    $(form.password).css({
                        'border-color': '#db281f'
                    });
                    return;
                }

                request = new Ajax('/user/bindAfter3PLogin.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        window.location.href = $.cookie('backPage');
                        setTimeout(function () {
                            window.location.href = "/";
                        }, 1000);
                    } else {
                        tips.html(data.errormsg).show();
                        $(form.username).removeClass('invalid');
                        $(form.password).removeClass('invalid');
                        if (data.errorcode === "3001") {
                            $(form.username)
                                .addClass('invalid');
                        } else if (data.errorcode === "3119") {
                            $(form.password)
                                .addClass('invalid');
                        } else if (data.errorcode === "3020") {
                            if (!form.username.value) {
                                $(form.username)
                                    .addClass('invalid');
                            } else if (!form.password.value) {
                                $(form.password)
                                    .addClass('invalid');
                            }
                        }
                    }
                });
            }
    	};

    	var login = new Login();
    });
}(window.requirejs));