(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'dialog', 'info', 'formVerified', 'addrsCtrl', 'tab'], function ($, Ajax, common, dialog, info, FormVerified, addrsCtrl) {
    	function FindPassword () {
            this.timeFlag = null;
            this.countDownBtn = null;
            this.onCountDown = false;
            this.accesskey = "";
    		this.init();
    	}

    	FindPassword.prototype = {
    		init: function () {
    			$('#fp-queryUser').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
    			this.listener();
                this.formAction();
    		},

    		listener: function () {
    			var that = this;
                
                $('[data-role="imageCode"]').on('click', 'img', function () {
                    $(this).attr('src', '/vc.htm?v=' + new Date().getTime());
                }).on('click', 'a', function () {
                    $(this).siblings('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                });

                $('#fp-getPhoneCode').on('click', function () {
                    if (!that.onCountDown) {
                        that.getPhoneCode('checkIDByPhone', $(this));
                    }
                });

                $('#fp-getEmailCodeBtn').on('click', function () {
                	that.getEmailCode('getEmailCode', true);
                });
    		},

            formAction: function () {
                var that = this,
                	queryUserVt = new FormVerified(document.forms.queryUser, function () {
                        that.queryUser();
                    }),
                    checkIDByPhone = new FormVerified(document.forms.checkIDByPhone, function () {
                        that.getAccesskey('checkIDByPhone');
                    }),
                    checkIDByEmail = new FormVerified(document.forms.checkIDByEmail, function () {
                        that.getAccesskey('checkIDByEmail');
                    }),
                    getEmailCodeVt = new FormVerified(document.forms.getEmailCode, function () {
                        that.getEmailCode('getEmailCode');
                    }),
                    updatePasswordVt = new FormVerified(document.forms.updatePassword, function () {
                        that.updatePassword();
                    });
                updatePasswordVt.checkPassword = function (value, notRequire) {
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
            },

            queryUser: function () {
            	var that = this,
            		tab = $('#fp-tab'),
            		phoneBtn = $('#fp-phoneBtn'),
            		emailBtn = $('#fp-emailBtn'),
            		form = document.forms.queryUser,
            		params = {
            			ape: form.ape.value,
            			validateCodeImg: form.validateCodeImg.value
            		},
            		request = new Ajax('/pwdBack/qryUserInfoByAPE.htm', params);
            	request.done(function (data) {
            		if (data.status === "200") {
            			if (data.re.markEmail) {
            				tab.find('li').removeClass('active');
            				$('#fp-emailText').html(data.re.markEmail);
            				$('#fp-tips-email').html(data.re.markEmail);
            				emailBtn.addClass('active');
            			} else {
            				emailBtn.hide();
            			}
                        if (data.re.markMobile) {
                        	tab.find('li').removeClass('active');
                        	$('#fp-phoneText').html(data.re.markMobile);
            				phoneBtn.addClass('active');
                        } else {
                        	phoneBtn.hide();
                        }
                        $('#fp-queryUser').removeClass('active');
                        that.setStep(2);
                        if (data.re.markEmail || data.re.markMobile) {
                            $('#fp-tab').addClass('active');
                        	tab.tab({
                        		callback: function (obj) {
                        			that.resetForm($('#' + obj.attr('data-target')));
                                	$('#' + obj.attr('data-target')).find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                        		}
                        	});
                        } else {
                        	$('#fp-fail-box').addClass('active');
                        }
                    } else {
                        common.errorDialog(data);
                    }
            	});
            },

            setStep: function (steps) {
            	var that = this;
            	$('#fp-steps-box').find('li').each(function (index) {
            		if (index < steps) {
            			$(this).addClass('active');
            		} else {
            			$(this).removeClass('active');
            		}
            	});
            },

            resetForm: function (target) {
                target.find('.valid').removeClass('.valid');
                target.find('.invalid').removeClass('.invalid');
                target.find('input[type="text"]').val("");
            },

            getPhoneCode: function (formName, btn) {
                var that = this,
                    form = document.forms[formName],
                    request = null,
                    hasError = false,
                    url = "/pwdBack/sendValidateCode4ValidateID8MobileNo.htm",
                    params = {
                        validateCodeImg: form.validateCodeImg.value
                    };
                if (form.validateCodeImg.value.length !== 4) {
                    $(form.validateCodeImg).addClass('invalid');
                    hasError = true;
                }
                    
                if (hasError) {
                    return;
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(form.validateCodeImg).removeClass('invalid valid');
                        $(form.phoneNo).removeClass('invalid valid');
                        dialog.show({
                            content: "已发送验证码，请注意查收"
                        });
                        that.startCountDown(btn, 60);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            getAccesskey: function (formName) {
                var that = this,
                    form = document.forms[formName],
                    url = "/common/checkValidateID.htm",
                    params = {
                        validatecode: form.validatecode.value
                    },
                    request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.accesskey = data.re.accesskey;
                        that.setStep(3);
                        $('#fp-tab').removeClass('active');
                        if (formName === "checkIDByPhone") {
                            $('#fp-checkIDByPhone').removeClass('active');
                        } else if (formName === "checkIDByEmail") {
          					$('#fp-checkIDByEmail').removeClass('active');
                            $('#fp-tips').removeClass("active");
                        }
                        $('#fp-updatePassword').addClass('active');
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            updatePassword: function () {
                var that = this,
                    form = document.forms.updatePassword,
                    params = {
                        newpassword: form.newpassword.value,
                        confirmpassword: form.confirmpassword.value,
                        accesskey: this.accesskey
                    },
                    request = new Ajax("/pwdBack/updateNewUserPassword.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                    	that.setStep(4);
                    	$('#fp-updatePassword').removeClass('active');
                    	$('#fp-success-box').addClass('active');
                        setTimeout(function () {
                            window.location.href = "/app/login.html";
                        }, 2000);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            getEmailCode: function (formName, isRepeat) {
                var that = this,
                    form = document.forms[formName],
                    params = {
                        validateCodeImg: form.validateCodeImg.value
                    },
                    request = new Ajax('/pwdBack/sendValidateCode2BingEmail.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (!isRepeat) {
                        	$('#fp-tips').addClass('active');
                        	$('#fp-getEmailCode').removeClass('active');
                        	$('#fp-checkIDByEmail').addClass('active');
                        }
                       that.startCountDown($('#fp-getEmailCodeBtn'), 120);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            startCountDown: function (btn, i) {
                var that = this,
                    countDown = function () {
                        i -= 1;
                        if (i <= 0) {
                            that.onCountDown = false;
                            btn.html('获取验证码');
                        } else {
                            btn.html('<em>' + i + '</em>秒后重新获取');
                            setTimeout(countDown, 1000);
                        }
                    };
                this.countDownBtn = btn;
                this.onCountDown = true;
                countDown();
            }
    	};

    	var findPassword = new FindPassword();
    });
}(window.requirejs));