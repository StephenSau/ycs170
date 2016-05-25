(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'formVerified', 'dialog', 'info', 'addrsCtrl', 'dial', 'carousel', 'chosen', 'placeholder', 'choice', 'share'], function ($, Ajax, common, FormVerified, dialog, info, addrsCtrl, dial) {
        function Index() {
            this.messageId = "";
            this.purposeParams = {};
            this.stepOneText = "";
            this.formName = "";
            this.hasPopover = false;
            this.$messageBox = $('#message-dialog .message-popover');
            this.nameStepOne = $('#popover-name-step1 .form-popover');
            this.nameStepTwo = $('#popover-name-step2 .form-popover');
            this.iconStepOne = $('#popover-icon-step1 .form-popover');
            this.iconStepTwo = $('#popover-icon-step2 .form-popover');
            this.addressStepOne = $('#popover-address-step1 .form-popover');
            this.addressStepTwo = $('#popover-address-step2 .form-popover');
            this.init();
        }

        Index.prototype = {
            init: function () {
                var that = this,
                    servicerVt = new FormVerified(document.getElementById('servicerForm'), function () {
                        that.addPurpose();
                    });
                $('#hw-carouselBox').carousel({
                    needInd: false,
                    autoPlay: false
                });
                $('#pp-carouselBox').carousel({
                    autoPlay: false,
                    changeStyle: 'gradual'
                });

                $("select").chosen();
                $('#sp-brand-tab').tab({
                    autoPlay: true,
                    interval: 4000
                });

                $('a[data-spy="share"]').share();
                
                this.listener();
                this.fillUserInfo();
                this.selectAction();

            },

            listener: function () {
                var that = this,
                    flag = null,
                    navbox = $('#nav-box'),
                    navBtn = $('#nw-navBtn'),
                    navInner = $('#nav-box-inner'),
                    nav = $('#nav');
                flag = setTimeout(function () {
                    navbox.css({
                        'overflow': 'hidden',
                        'width': '210px'
                    });

                    // Phoenix NOTE 2016-02-01
                    // 产品要求：暂时不隐藏此菜单，隔一段时间看点击效果
                    // navInner.animate({
                    //     'margin-top': "-445px"
                    // }, 800, function () {
                    //     navbox.removeAttr('style');
                    //     navInner.removeAttr('style');
                    //     navbox.hide();
                    //     navBtn.removeClass('active');
                    // });
                }, 2000);
                navbox.on('mouseenter', function () {
                    clearTimeout(flag);
                    $(this).css({'width': '1210px'});
                }); 

                // Phoenix NOTE 2016-02-01
                // Reset active `li` when mouseleave
                navbox.on('mouseleave', function(){
                    $('#nav>li').removeClass('active');
                    $(this).css({'width': '210px'});
                });

                $('#set-pancel>li').on("mouseenter", function () {
                    $(this).siblings('li').removeClass('active');
                    $(this).addClass('active');
                });

                $('#tb-reg-out-btn').on('click', function () {
                    setTimeout(function () {
                        that.fillUserInfo();
                    }, 200);
                });

                $('#promo-name, #promo-address, #promo-icon').on('click', function (event) {
                    that.formName = this.id.split('-')[1];
                    that.showStepOne();
                });

                $('#nav').unbind('mouseleave');
            },

            showStepOne: function () {
                var that = this,
                    form = null,
                    formVt = null;
                info.show({
                    content: this[this.formName + 'StepOne']
                });

                form = document.forms[this.formName + "StepOneForm"];
                $(form).find('input[type="text"], textarea').removeClass('invalid valid').val("");
                $(form).find('input[type="text"]').placeholder();
                formVt = new FormVerified(form, function () {
                    info.close();
                    that.stepOneText = form.stepOneText.value;
                    that.showStepTwo();
                });
            },

            showStepTwo: function () {
                var that = this,
                    form = null,
                    formVt = null;
                info.show({
                    content: this[this.formName + 'StepTwo']
                });
                form = document.forms[this.formName + "StepTwoForm"];
                $(form).find('input[type="text"]').removeClass('invalid valid').val("");
                if (this.formName === "address") {
                    $(form).find('input[type="radio"]').attr('checked', false).choice().trigger('choice:update');
                } else if (this.formName === "name" || this.formName === "icon") {
                    form.company.value = this.stepOneText;
                }
                $(form).find('input[type="text"]').placeholder();
                formVt = new FormVerified(form, function () {
                    that.packageParams();
                });
            },

            addPurpose: function () {
                var that = this;
                this.formName = "servicerForm";
                this.packageParams(); 
            },

            packageParams: function () {
                var that = this,
                    form = document.forms[this.formName + "StepTwoForm"];
                if (this.formName === "servicerForm") {
                    form = document.forms.servicerForm;
                }
                this.purposeParams = {
                    sourcetype: "10",
                    tel: form.tel.value,
                    title: form.title.value,
                    province: "",
                    city: "",
                    district: "",
                    comments: ""
                };
                if (this.formName === "name") {
                    this.purposeParams.sdcat1 = "310000";
                    this.purposeParams.comments = "公司取名查询：" + form.company.value;
                } else if (this.formName === "icon") {
                    this.purposeParams.sdcat1 = "350000";
                    this.purposeParams.comments = "公司商标查询：" + form.company.value;
                } else if (this.formName === "address") {
                    this.purposeParams.sdcat1 = "310000";
                    this.purposeParams.comments = "公司选址查询：需求：" + (this.stepOneText || "未知") + 
                                                "；行业：" + (form.industry.value || "未知") + 
                                                "；公司情况：" + (form.condition.value || "未知") +
                                                "；意向地址：" + (form.intendtion.value || "未知");

                } else if (this.formName === "servicerForm") {
                    this.purposeParams = {
                        sourcetype: "10",
                        title: form.title.value,
                        tel: form.tel.value,
                        province: form.province.value,
                        city: form.city.value,
                        district: form.district.value,
                        sdcat1: form.sdcat1.value
                    };
                }
                this.postPurpose();
            },

            postPurpose: function () {
                var that = this,
                    messageVt = null,
                    request = new Ajax('/servicer/addPurpose.htm', this.purposeParams);
                request.done(function (data) {
                    if (data.status === "200") {
                            info.close();
                            that.messageId = data.re.id;
                            info.show({
                                content: that.$messageBox
                            });
                            $(document.forms.messageForm).find('input[type="text"]').removeClass('invalid valid').val("");
                            $('#message-form input[type="text"]').placeholder();
                            messageVt = new FormVerified(document.getElementById('message-form'), function () {
                                that.editPurpose();
                            });
                            if (that.formName === "servicerForm") {
                                $('#servicerForm').find('.valid,.invalid').removeClass('valid invalid');
                                $('#servicerForm').find('input').val("");
                                $('#spb-comments').val('-1').trigger('chosen:update');
                                that.selectAction();
                            }
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
                            $(document.forms[that.formName+"StepTwoForm"]).find('input').removeClass('invalid valid').val('');
                        } else {
                            info.close();
                            common.errorDialog(data);
                        }
                });

            },

            fillUserInfo: function () {
                var that = this;
                function query() {
                    var coupon = $('#member-coupon-links'),
                        register = $('#member-register-links'),
                        noLogin = $('#member-noLogin-box'),
                        logined = $('#member-logined-box'),
                        unpay = $('#member-unpay'),
                        service = $('#member-service'),
                        comment = $('#member-comment');
                    if (common.userInfo){
                        if (common.userInfo.isLogin === "1") {
                            register.hide();
                            coupon.show();
                            noLogin.hide();
                            logined.show();
                            that.queryCoupon();
                            unpay.html(common.userInfo.waitPayCount);
                            service.html(common.userInfo.workinCount);
                            comment.html(common.userInfo.waitReviewCount);
                        } else if (common.userInfo.isLogin === "0") {
                            register.show();
                            coupon.hide();
                            noLogin.show();
                            logined.hide();
                            unpay.html("0");
                            service.html("0");
                            comment.html("0");
                        }
                    } else{
                        setTimeout(query, 50);
                    }
                }
                query();
            },

            queryCoupon: function () {
                var that = this,
                    request = new Ajax('/user/findOutCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        $('#member-coupon-num').html(data.re.list.length);
                    } else {
                        common.errorDialog(data);
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
        
        var index = new Index();
    });
    
}(window.requirejs));