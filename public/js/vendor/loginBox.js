(function (define) {
    'use strict';
    define(['jquery', 'info', 'cookie'], function ($, info) { 
    	function LoginBox (){
    		this.init();
    	}

    	LoginBox.prototype = {
    		init: function () {

    		},

    		show: function () {
    			
    		},

    		loginPass: function () {
                var that = this,
                	form = document.forms.loginform,
                    params = {
                        username: form.username.value,
                        password: form.password.value
                    };
                if (!form.username.value) {
                    /*dialog.show({
                        content: "请填写用户名"
                    });*/
                    return;
                } else if (!form.password.value) {
                    /*dialog.show({
                        content: "请输入密码"
                    });*/
                    return;
                }
                
                $.ajax({
                    url: "/user/login.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function (data) {
                        if (data.status === "200") {
                            if (form.rememberme.checked) {
                                $.cookie('accountname', form.username.value, {expires: 7, path: '/'});
                            } else {
                                $.removeCookie('accountname', {path: '/'});
                            }

                            that.setUserInfo(data.re);
                            if ($.cookie('orderCommit')) {
                                window.location.href = "/app/order_commit.html";
                            }
                            info.close();
                        } else {
                            /*dialog.show({
                                content: data.errormsg
                            });*/
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
                    },
                    
                    error: function (data) {
                    }

                });
            },

            setUserInfo: function (params) {
                var key = "";
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        $.cookie(key, params[key], { expires: 7, path: '/'});
                    }
                }
            },
    	};

    	return new LoginBox();
    });
}(window.define));