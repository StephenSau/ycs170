(function (define) {
    "use strict";
    define(['jquery', 'ajax', 'dialog', 'info', 'addressBox', 'cookie', 'json', 'tab'], function ($, Ajax, dialog, info, addressBox) {
        function Common() {
        	this.userInfo = null;
        	this.init();
        }

        Common.NOSAVEPAGES = ['login', 'register', '404', '500', 'findPassword'];
        Common.NEEDLOGINPAGE = [
            'cashier', 'commnents', 'favishop', 'message', 'myService',
            'myServiceInfo', 'orderInfo', 'orderList', 'personalCenter', 'quan',
            'settings', 'cart', 'cartlist', 'recycle'];//加上两个需要首页的页面购物车与结算页
        Common.TIMEFLAG = null;

        Common.prototype = {
            init: function () {
            	var that = this;
                this.addQQTalk();
                this.getUserInfo();
                this.setLinkInfo();
                this.searchForm();
                this.getCityCode();
                if (document.getElementById('top-bar')) {
                	this.rebuildTopBar();
                }
                if (document.getElementById('top-banner')) {
                	this.rebuildTopBanner();
                }

                if (document.getElementById('footer-float')) {
                	this.assist();
                }

                if (document.getElementById('links-tab')) {
                	$('#links-tab').tab({
                		listener: 'mouseenter'
                	});
                }
                this.searchListener();

                if (document.getElementById('head-float')) {
                	this.headFloatAction();
                }

                if (document.getElementById('nav-box')) {
                    this.navAction();
                }

                if (document.getElementById('pcNav')) {
                    this.pcNavAction();
                }

                if (document.getElementById('top-showAddress')) {
                	$('#top-showAddress').on('click', function () {
                        addressBox.show($(this), function () {
                            that.setCityCode();
                        });
                	});
                }

                if (document.getElementById('pcNav-servicer')) {
                    this.queryHotServicer(1);
                    $('#pcNav-servicer-changeBtn').on('click', function () {
                        that.queryHotServicer($(this).attr('data-value'));
                    });
                }

                if (navigator.userAgent.indexOf("MSIE") !== -1 && /MSIE (\d\.\d)/.exec(navigator.userAgent)[1]*1 < 9) {
                    $('#LinkBtn, #sidebarOnlineCS').on('click', function () {
                        document.getElementById('top-qqTalk').click();
                    });
                } else {
                    $('#LinkBtn, #sidebarOnlineCS').on('click', function () {
                        _MEIQIA._SHOWPANEL();
                    });
                }

                
            },

            searchForm: function () {
                $('#headWrapSearchForm, #headFloatSearchForm').on('submit', function (event) {
                    event.preventDefault();
                    if (this.querycondition.value !== "") {
                        this.querycondition.value = $.trim(this.querycondition.value);
                        this.querycondition.value = this.querycondition.value.replace(/[?&\#\~@\$\*\/]/ig, '');
                        this.submit();
                    }
                });
            },

            queryHotServicer: function (page) {
                var that = this,
                    btn = $('#pcNav-servicer-changeBtn'),
                    currentPage = btn.attr('data-value')*1,
                    values = $('#top-showAddress').attr('data-value').split(','),
                    params = {
                        pageNumber: page,
                        pageSize: 6,
                    },
                request = new Ajax("/user/qryHotServicers.htm", params);
                request.done(function(data) {
                    if (data.status === "200") {
                        that.writeHotList(data.re);
                        currentPage = currentPage === data.re.totalPage ? 1 : currentPage + 1;
                        btn.attr('data-value', currentPage);
                    } else {
                        that.errorDialog(data);
                    }
                });
            },

            writeHotList: function (data) {
                var i = 0,
                    length = data.servicer.length,
                    item = {},
                    url = '',
                    list = $('#pcNav-servicer-list'),
                    html = [];
                for(i = 0; i < length; i += 1) {
                    item = data.servicer[i];
                    html.push('<li>');
                    html.push('<a href="/servicer/getServicerDetail4V3Jsp.htm?servicerid=' + item.id + '">');
                    url = item.logo.replace('http:', '');
                    html.push('<img src="' + url + '" alt="" />');
                    html.push('</a>');
                    html.push('</li>');
                }

                list.empty().append(html.join(''));
            },

            setCityCode: function () {
            	var that = this,
            		values = $('#top-showAddress').attr('data-value').split(','),
            		params = {
            			province: values[0],
            			city: values[1],
            		},
                	request = new Ajax("/common/setCitycode.htm", params);
                    request.done(function (data) {
                        if (data.status === "200") {
                            that.setCookie({'provinceName': data.re.provinceCN});
                            that.setCookie({'cityName': data.re.cityCN});
                            that.setCookie({'provinceCode': data.re.province});
                            that.setCookie({'cityCode': data.re.city});
                        }
                    });
            },

            getCityCode: function () {
                var that = this,
                    request = null,
                    provinceName = $.cookie('provinceName'),
                    cityName = $.cookie('cityName'),
                    provinceCode = $.cookie('provinceCode'),
                    cityCode = $.cookie('cityCode');
                if (!(provinceName && cityName && provinceCode && cityCode)) {
                    request = new Ajax("/common/setCitycode.htm");
                    request.done(function (data) {
                        if (data.status === "200") {
                            that.setCookie({'provinceName': data.re.provinceCN});
                            that.setCookie({'cityName': data.re.cityCN});
                            that.setCookie({'provinceCode': data.re.province});
                            that.setCookie({'cityCode': data.re.city});
                            $('#top-city').html(data.re.cityCN);
                            $('#top-showAddress').attr('data-value', data.re.province + "," + data.re.city);
                        }
                    });
                } else {
                    $('#top-city').html(cityName);
                    $('#top-showAddress').attr('data-value', provinceCode + "," + cityCode);
                }
                
                
            },

            setLinkInfo: function () {
            	var reg = new RegExp ('(' + Common.NOSAVEPAGES.join('|') + ')', 'i');
            	if (!reg.test(window.location.href)){
            		this.setCookie({'backPage': window.location.href});
            	}
            },

            headFloatAction: function () {
            	var box = $('#head-float'),
            		nav = $('#fh-nav-box'),
            		btn = $('#hf-navBtn'),
            		flag = null,
            		showBox = function () {
                        if ($(this).scrollTop() > 680) {
                            box.show();
                        } else {
                        	nav.hide();
                            box.hide();
                        }
                    };
                $(window).on('scroll', showBox);
                btn.on('mouseenter', function () {
                	nav.show();
                	btn.addClass('active');
                });
                nav.on('mouseleave', function () {
                	flag = setTimeout(function () {
            			nav.hide();
            			btn.removeClass('active');
            		}, 1000);
                }).on('mouseenter', function () {
                	clearTimeout(flag);
                });
                $('#fh-nav').on('mouseenter', '>li[data-role="item"]', function () {
                	$(this).siblings('li').removeClass('active');
                	$(this).addClass('active');
                });
                showBox.call(window);
            },

            navAction: function () {
            	var flag = null,
                    navbox = $('#nav-box'),
                    navBtn = $('#nw-navBtn'),
                    navInner = $('#nav-box-inner'),
                    nav = $('#nav');
            	navBtn.on('mouseenter', function () {
                    navBtn.addClass('active');
                    setTimeout(function () {
                        navbox.show();
                    }, 800);
                });
                nav.on('mouseenter', '>li[data-role="item"]', function () {
                    $(this).siblings('li').removeClass('active');
                    $(this).addClass('active');
                }).on('mouseleave', function () {
                    flag = setTimeout(function () {
                        navbox.fadeOut();
                        navBtn.removeClass('active');
                    }, 500);
                }).on('mouseenter', function () {
                    clearTimeout(flag);
                });
            },

            pcNavAction: function () {
                var menu = $('#pcNav'),
                    url = window.location.href,
                    link = '',
                    items = menu.find('li[data-role="nav"]');
                items.each(function (index) {
                    link = $(this).children('a').attr('href');
                    if (url.indexOf(link) !== -1 ||
                    	((url.indexOf('orderInfo') !== -1 || url.indexOf('recycle') !== -1) && 
                    	link.indexOf('orderList') !== -1) ||
                        (url.indexOf('myServiceInfo') !== -1 && 
                        link.indexOf('myService') !== -1) ||
                        (url.indexOf('settings') !== -1 && link.indexOf('settings') !== -1)) {
                        $(this).addClass('active');
                    }
                });                                                                                                                                                                                  
            },

            searchListener: function () {
            	var flag = null,
                    resetWords = function () {
                        $('#' + $(this).attr('data-menu-id')).unbind('mouseleave').unbind('mouseenter');
                        if (this.value.length <= 0) {
                            $('#' + $(this).attr('data-words-id')).show();
                        } else {
                            $('#' + $(this).attr('data-words-id')).hide();
                        }
                    };
            	$('input[data-role="search"]').on('focus', function () {
                	$('#' + $(this).attr('data-menu-id')).on('mouseleave', function () {
                		var that = this;
                		flag = setTimeout(function () {
                			$(that).hide();
                		}, 500);
                	}).on('mouseenter', function () {
                		clearTimeout(flag);
                	}).show();
                	$('#' + $(this).attr('data-words-id')).hide();
                }).on('blur', function () {
                    resetWords.call(this);
                }).each(function () {
                    this.value = "";
                    resetWords.call(this);
                });
            },

            addQQTalk: function () {
                var number = '1001',
                    url = window.location.href;
                try{
                    BizQQWPA.addCustom([
                    {
                        aty: '1',
                        a: number,
                        nameAccount: 4008310866,
                        node: document.body
                    }, {
                        aty: '1',
                        a: number,
                        nameAccount: 4008310866,
                        selector: 'top-qqTalk'
                    }, {
                        aty: '1',
                        a: number,
                        nameAccount: 4008310866,
                        selector: 'footer-qqtalk'
                    }
                    ]);
                } catch (e) {
                   $('#top-qqTalk').parent('li').hide();
                   $('#footer-qqtalk').hide(); 
                }
            },

            rebuildTopBar: function () {
            	$('#top-bar').on('mouseenter', 'li[data-spy="menu"]', function () {
            		$('#top-bar li[data-spy="menu"]').removeClass('active');
            		$(this).addClass('active');
            	}).on('mouseleave', '[data-spy="submenu"]', function () {
            		$(this).parents('li[data-spy="menu"]').removeClass('active');
            	});
            },

            rebuildTopBanner: function () {
            	var banner = $('#top-banner');
            	banner.show();
            	$('#tbr-closeBtn').on('click', function () {
            		banner.hide();
            	});
            },

            getUserInfo: function (callback) {
                var that = this,
                	request = new Ajax("/user/qryUserInfos.htm");
                request.done(function (data) {
                	that.userInfo = data.re;
                	if (data.re.isLogin === "1") {
                		that.changeStatus(true);
                	} else {
                		that.changeStatus(false);
                	}
                	if (callback && typeof callback === 'function') {
                            callback(data.re);
                        }
                });
            },

            changeStatus: function (isLogin) {
            	var that = this,
            		user = $('#tb-user'),
                	status = $('#tb-status'),
                	login = $('#tb-login'),
                	btn = $('#tb-reg-out-btn');
                //TODO: 绑定独立functions，以免对跟踪同时解绑
                status.parent('.tb-right').show();
            	if (isLogin) {
            		user.html(this.userInfo.username);
            		btn.attr('href', '#').text("退出").on('click', function (event) {
            			event.preventDefault();
            			that.logout();
            		});
                    $('#hf-user').text(this.userInfo.username).show();
                    $('#hf-lr-group').hide();
            		status.show();
            		login.hide();
            	} else {
            		btn.attr('href', '/app/register.html').text('免费注册').unbind('click');
                    $('#hf-user').text('--').hide();
                    $('#hf-lr-group').show();
            		status.hide();
            		login.show();
            	}
            },

            needOut: function () {
                var i = 0,
                    url = window.location.href,
                    length = Common.NEEDLOGINPAGE.length,
                    result = false;
                for (i = 0; i < length; i += 1) {
                    if (url.indexOf(Common.NEEDLOGINPAGE[i]) !== -1) {
                        result = true;
                        break;
                    }
                }
                return result;
            },

            logout: function () {
            	var that = this,
                    request = new Ajax("/user/loginout.htm");
                request.done(function (data) {
                    if (data.status === "200") {
                    	that.userInfo = {};
                        that.userInfo.isLogin = "0";
                        if (that.needOut()) {
                            window.location.href = "/";
                        } else {
                            that.changeStatus(false);
                        }
                    }
                });
            },

            setCookie: function (params) {
            	var key = "";
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        $.cookie(key, params[key], { expires: 7, path: '/'});
                    }
                }
            },

            errorDialog: function (data, callback, args) {
                var that = this,
                    message = data.errormsg,
                    code = data.errorcode,
                    actions = [];
                if (code === "1034" || code === "3400" || code === "3000") {
                    
                    actions = [{
                            name: "重新登录",
                            callBack: function () {
                                dialog.close();
                                window.location.href="/app/login.html";
                                
                            }
                        }];
                } else {
                    actions = [{
                            name: "确定",
                            callback: function () {
                                dialog.close();
                            }
                        }];
                }
                
                dialog.show({
                    content: message,
                    buttons: actions
                });
            },

            getParams: function (seg) {
                if (window.location.search) {
                    var items = window.location.search.substring(1).split("&"),
                        params = {},
                        i = 0;
                    for (i = 0; i < items.length; i += 1) {
                        params[items[i].split('=')[0]] = items[i].split('=')[1];
                    }
                    if (params[seg]) {
                        return params[seg];
                    } else {
                        return "";
                    }
                } else {
                    return "";
                }
            },

            assist: function () {
            	var box = $('#footer-float'),
            		returnTopBtn = $('#ff-returnTop'),
            		returnTop = function () {
                        var t = 0,
                            b = $(window).scrollTop(),
                            c = 0,
                            d = 360,
                            temp = 0,
                            easeInSine = function (x, t, b, c, d) {
                                if (c < b) {
                                    temp = c;
                                    c = b;
                                    b = temp;
                                    return c - (-c * Math.cos(t / d * (Math.PI / 2)) + c + b);
                                }
                                return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
                            },
                            animate = function () {
                                if (t >= d) {
                                    $(window).scrollTop(c);
                                    $(this).css({
                                        'visibility': 'hidden'
                                    });
                                } else {
                                    $(window).scrollTop(easeInSine(0, t, b, c, d));
                                    setTimeout(animate, 30);
                                }
                                t += 30;
                            };
                        animate();
                    },
                    showBox = function () {
                        if ($(this).scrollTop() > 0) {
                            box.show();
                        } else {
                            box.hide();
                        }
                    },
                    resizeBox = function () {
                    	if ($(this).width() < 1390) {
                			box.addClass('footer-float-right');
	                	} else {
	                		box.removeClass('footer-float-right');
	                	}
                    };
               	//$(window).on('scroll', showBox);
                returnTopBtn.on('click', returnTop);
                //showBox.call(window);
                //$(window).on('resize', resizeBox);
                //resizeBox.call(window);
            }
        };
        
        return new Common();
    });
}(window.define));

