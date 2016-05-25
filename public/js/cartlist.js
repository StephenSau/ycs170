/**
 * Created by Administrator on 2015/12/29 0029.
 */
/*
 ***订单确定
 */
(function(requirejs) {
    'use strict';
    requirejs(['jquery', 'common',
        'formVerified', 'info', 'dialog','handlebars','chosen','ajax'
    ], function($, common, FormVerified, info, dialog,Handlebars,chosen,Ajax) {


        var Cartlist = function() {
            /*初始化数据*/
            this.hasLogined = false;
            this.needForcedStop = false;
            this.loginSatus = "telphone";
            this.onImgCode = false,
            this.userid = "",
            this.$cartCoupon = [],
            this.$cartlist = $(".cart-list .list"),
            this.isNewCreateUser = "";
            this.mobile ='';
            this.username = '';
            this.plainPassword ='';
            this.serviceItemInfos= [];
            this.couponid = common.getParams("couponid") || '';
            this.contactFlag = '';
            this.oSubmitBtn = $('.submit-btn input');

            /*初始化页面*/
            this.init();
        };

        Cartlist.prototype = {

            init: function() {
                this.registerHHelper();
                this.initDisable();
                this.initLogin();
                this.listener();
                this.setFlagCookie();

                
            },

            listener: function() {
                var that = this,
                    phone = $('#l_telphone');
                $(document.forms.loginform).submit(function(event) {
                    event.preventDefault();
                    if (!that.hasLogined) {
                        if (that.loginSatus === "common") {
                            that.loginPass();
                        } else if (that.loginSatus === "telphone") {
                            that.loginByPhone();
                        } else if (that.loginSatus === "image") {
                            that.checkImageCode();
                        }
                    }
                });

                $('#lb_imgCode').on('click', $.proxy(this.changeImgCode, this));
                $('#lb_changeImgCode').on('click', $.proxy(this.changeImgCode, this));
                $('#toPhoneLogin').on('click', function() {
                    if (!that.hasLogined) {
                        that.changeLoginBox('telphone');
                    }
                });
                $('#lb_toNormalLogin').on('click', function() {
                    if (!that.hasLogined) {
                        that.changeLoginBox('common');
                    }
                });

                phone.on('keyup', function() {
                    if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(phone.val())) {
                        $(this).addClass('invalid').removeClass('valid');
                    } else {
                        $(this).removeClass('invalid').addClass('valid');
                    }
                });

                $('#lb_getPhoneCode').on('click', function() {
                    if (!that.hasLogined) {
                        if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(phone.val())) {
                            return;
                        }
                        if (!that.onCountDown) {
                            that.getPhoneCode();
                        }
                    }
                });

                $('#lb_checkImgCodeBtn').on('click', function() {
                    that.checkImageCode();
                });

                /*使用卡券*/
                $(".cartlist").on("change"," .coupon select",function(){
                    if($(this).val()){
                       that.getMyCoupon(this);
                    }else{
                        if($(".couponset").length){
                            $(".couponset").hide();
                            that.noCardAmount();
                        }
                    }
                })
                /*使用卡券*/
                $(".cartlist").on("click",".exchange-btn",function(){
                    that.activeMyCard();
                })

                /*下单页*/
                $(".cartlist").on("click",".btn-shop",function(){
                    that.createOrder();
                })

                $(document).on("click","#contactlist dd:not(':last')",function(){
                                    that.checkAddress(this);
                                });
                $(document).on("mouseenter","#contactlist dd:not(':last')",function(){
                                    that.defaultAddressEnter(this);
                                });
                 $(document).on("mouseleave","#contactlist dd:not(':last')",function(){
                                    that.defaultAddressLeave(this);
                                });
                 $(document).on("click","#contactlist .action span",function(event){
                                    that.editAddress(this,event);
                                });

                 $(document).on("click","#contactlist strong",function(event){
                                    that.setDefault(this,event);
                                });

                 $(document).on("click","#contactlist .action em",function(event){
                                    that.deleteAddress(this,event);
                                });
                 /*关闭了解了解*/
                $(document).on("click", ".close-dialog", function() {
                    info.close();
                });

                $(document).on("click", "#contactlist .add-icon", function(event) {
                    that.createNewAddress(event);
                });



            },


            addressList : function(){

                var that = this,
                    request = new Ajax('/user/newQryContacts.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        var tpl = Handlebars.compile($("#contactlist-tpl").html()),
                            contactArr = data.re.contacts;
                            if(contactArr.length){
                                $("#contactlist").html(tpl(contactArr));
                                that.initAddress();
                            }else{
                                $("#contactlist").hide();
                               $(".fill_contact").show();
                            }



                    } else {
                        common.errorDialog(data);
                    }
                });

            },

            checkAddress : function(obj){
                var addressList = $("#contactlist dd:not(':last')"),
                    $this = $(obj);

                    addressList.removeClass('active');
                    $this.addClass('active');

            },
            defaultAddressEnter : function(obj){
                var $this = $(obj),
                    $defaultAddress = $this.find("strong");

                    $defaultAddress.addClass('show');


            },
            defaultAddressLeave : function(obj){
                var $this = $(obj),
                    $defaultAddress = $this.find("strong");

                    $defaultAddress.removeClass('show');
            },
            setDefault : function(obj,event){
                var that = this,
                    $this = $(obj),
                    params = {},
                    request = null,
                    $parent = $this.parents("dd");
                    event.stopPropagation();

                    params = {
                            id : $parent.find("[data-id]").attr("data-id"),
                            isdefault : '1',
                            name : $parent.find(".position span").text(),
                            mobile :$parent.find(".phone").text() ,
                            companyid : -1
                        };

                        request = new Ajax('/user/newEditContacts.htm',params);

                        request.done(function(data){
                            if(data.status === '200'){
                                $("#contactlist dd:not(':last') strong").removeClass('active').text("设置默认联系人").attr("data-default","0");
                                $this.addClass("active").text("默认联系人");
                                $this.attr("data-default","1");

                            } else {
                                info.close();
                                common.errorDialog(data);
                            }
                        })
            },

            
            editAddress : function(obj,event){
                var that = this,
                    params = {},
                    $this = $(obj),
                    $parent = $this.parents("dd"),
                    username = "",
                    mobile = "",
                    contactListLen = $("#contactlist dd:not(':last')").length,
                    request = null;

                    /*阻止冒泡*/
                    event.stopPropagation();

                    that.contactAddress(obj);
                    /*修改地址*/
                    new FormVerified(document.getElementById("editAddress-form"), function() {

                        username = $.trim($("#contact_username").val());
                        mobile = $.trim($("#contact-mobile").val());

                        if(username === $parent.find(".position span").text() && mobile === $parent.find(".phone").text() ){

                            info.close();
                            return;

                        }

                        if(contactListLen !== 1 && that.similarityAction(obj)){
                            that.similarityEdit(obj);
                            info.close();
                            return;
                        }
                        
                        

                        params = {
                            id : $this.parent().attr("data-id"),
                            name : username,
                            mobile : mobile,
                            isdefault : $this.parents("dd").find("[data-default]").attr("data-default"),
                            companyid : -1,
                            modifylocation : 1
                        };

                        request = new Ajax('/user/newEditContacts.htm',params);

                        request.done(function(data){
                            if(data.status === '200'){
                                info.close();
                                $parent.find(".position span").text(username);
                                $parent.find(".phone").text(mobile);
                            } else {
                                info.close();
                                common.errorDialog(data);
                            }
                        })


                    })

            },
            createNewAddress : function(event){
                var that =this,
                    username = '',
                    mobile = '',
                    params = {},
                    request = null,
                    html = [];
                /*阻止冒泡*/
                    event.stopPropagation();

                    that.contactAddress();
                    /*修改地址*/
                    new FormVerified(document.getElementById("editAddress-form"), function() {

                        username = $.trim($("#contact_username").val());
                        mobile = $.trim($("#contact-mobile").val());

                        if(that.similarityCreate()){
                            return;
                        }
                        
                        params = {
                            name : username,
                            mobile : mobile,
                            companyid : -1
                        };


                        request = new Ajax('/user/newAddContact.htm',params);

                        request.done(function(data){
                            if(data.status === '200'){

                                info.close();
                                html.push('<dd class="active">');
                                html.push('<p class="position clearfix"><span>'+username+'</span><em></em></p>');
                                html.push('<p class="phone">'+mobile+'</p>');
                                html.push('<p class="action" data-id="'+data.re.id+'"><span>编辑</span><em>删除</em></p>');
                                html.push('<strong data-default="0">设置默认联系人</strong>');
                                html.push('<i class="checked-icon"></i>');
                                html.push('</dd>');

                                $("#contactlist dd:not(':last')").removeClass('active');
                                $("#contactlist").prepend(html.join(""));
                                that.initAddress();
                                
                            } else {
                                info.close();
                                common.errorDialog(data);
                            }
                        })

                    })

            },

            similarityCreate : function(){
                    var list = $("#contactlist dd:not(':last')");
                    if(this.similarityAction()){
                        list.removeClass("active");

                        $("#contactlist").prepend(list.filter(".move").addClass('active'));
                            list.filter(".move").removeClass("move");

                            info.close();
                        return true;
                    }

            },

            similarityEdit : function(obj){
               var  that = this,
                    list = $("#contactlist dd:not(':last')"),
                    $this = $(obj),
                    $parent = $this.parents("dd"),
                    params = {
                        contactid : $this.parent().attr("data-id")
                    },
                    request = null;

                    request = new Ajax('/user/delMyContact.htm',params);

                    request.done(function(data){
                        if(data.status === '200'){
                            dialog.close(); 

                            if($parent.is(".active")){
                                list.filter(".move").addClass('active');
                            }
                            $parent.remove(); 

                            if($parent.find("[data-default]").attr("data-default")==="1"){

                                that.setDefault(list.filter(".move").find(
                                    "strong"),event);
                            }
                            that.initAddress();
                        }else{
                            common.errorDialog(data);
                        }
                    });
            },

            similarityAction:function(obj){
                var similarityFlag= false,
                    $target = obj !==undefined ? $(obj).parents("dd") : '',
                    list = $("#contactlist dd:not(':last')").not($target),
                    username = $.trim($("#contact_username").val()),
                    mobile = $.trim($("#contact-mobile").val());

                    $.each(list,function(){
                        var $this = $(this),
                            name = $this.find(".position span").text(),
                            phone = $this.find(".phone").text();

                        if(name === username && mobile === phone){
                            list.removeClass("move");
                            $this.addClass("move");
                            similarityFlag=true;
                            return false;
                        }

                    });

                return similarityFlag;
            },


            deleteAddress : function(obj,event){
                var that = this;
                    event.stopPropagation();
                    dialog.show({
                        content : '确定删除此联系人信息',
                        buttons : [{
                            name : '确定',
                            callBack : function(){
                                that.deleteAddressAjax(obj);
                            }
                        }]
                    })
                    
            },

            deleteAddressAjax : function(obj){
                var that = this,
                    $this = $(obj),
                    $parent = $this.parents("dd"),
                    params = {
                        contactid : $this.parent().attr("data-id")
                    },
                    request = new Ajax('/user/delMyContact.htm',params);


                    request.done(function(data){
                        if(data.status === '200'){
                            dialog.close(); 
                            $parent.remove(); 

                            if($parent.find("strong").attr("data-default")==='1'){

                                that.switchDefault(obj);            
                            }else{
                                if($parent.is(".active")){

                                    $("#contactlist dd").has("[data-default='1']"). addClass('active');
                                }
                                that.initAddress();

                            }
                            
                        }else{
                            common.errorDialog(data);
                        }
                    })
            },
            switchDefault : function(obj){
                var that = this,
                    $this = $(obj),
                    $target = $("#contactlist [data-init]:first").length ? $("#contactlist [data-init]:first") :$("#contactlist dd:first") ,
                    params = {},
                    request = null,
                    $parent = $this.parents("dd");
                    event.stopPropagation();

                    params = {
                            id : $target.find("[data-id]").attr("data-id"),
                            isdefault : '1',
                            name : $target.find(".position span").text(),
                            mobile :$target.find(".phone").text() ,
                            companyid : -1
                        };

                        request = new Ajax('/user/newEditContacts.htm',params);

                        request.done(function(data){
                            if(data.status === '200'){

                                $target.find("strong").addClass("active").text("默认联系人").attr("data-default","1");


                                if($parent.is(".active")){
                                    $target.addClass('active')
                                }

                                that.initAddress();
                                } else {
                                    info.close();
                                    common.errorDialog(data);
                                }
                        })
            },

            initAddress : function(){
                if($("#contactlist dd:not(':last')").length === 1){
                    $("#contactlist .action em").hide();

                    }else{
                        $("#contactlist .action em").show();
                    }
            },

            contactAddress : function(obj){

                var html = [],
                    $this = obj ? $(obj) : null,
                    $parent = null,
                    username = '',
                    mobile = '';

                    if($this){
                        $parent = $this.parents("dd"),
                        username = $parent.find(".position span").text(),
                        mobile = $parent.find(".phone").text();
                    }

                    html.push("<div class='edit-address'>");
                    html.push("<form id='editAddress-form'>");
                    html.push("<p class='contactor clearfix'><label for='contact_username'><span>*</span>联系人</label><input type='text' name='username' id='contact_username' data-rule='checkWords:2,8' maxLength='8' value='"+username+"'></p>");
                    html.push("<p class='phoner clearfix'><label for='contact-mobile'><span>*</span>联系人手机号码</label><input type='text' id='contact-mobile' name='mobile' data-rule='checkTelphone' maxLength='11' value='"+mobile+"'></p>");
                    html.push("<p class='action'><input type='submit' class='btn btn-primary' value='保存'><input type='button' class='btn btn-primary close-dialog' value='取消'></p>");
                    html.push("</form");
                    html.push("</div>");
                    info.show({
                        content : html.join("")

                    });

            },
            setFlagCookie : function(){
                $.cookie("flagcookie",true);
            },
            changeImageBox: function() {
                if (this.onImgCode) {
                    this.onImgCode = false;
                    this.loginSatus = 'telphone';
                    $('#lb_telphoneLine').show();
                    $('#lb_phoneCodeLine').show();
                    $('#lb_imgCodeLine').hide();
                    $('#lb_rememberLine').show();
                    $('#lb_submitBtn').text("登录");
                } else {
                    this.onImgCode = true;
                    this.loginSatus = "image";
                    $('#lb_telphoneLine').hide();
                    $('#lb_phoneCodeLine').hide();
                    $('#lb_imgCodeLine').show();
                    $('#l_imgCode').val('');
                    $('#lb_rememberLine').hide();
                    $('#lb_submitBtn').text("确定");
                    this.changeImgCode();
                }
            },
            changeImgCode: function() {
                $('#lb_imgCode').attr('src', "/vc.htm?time=" + new Date().getTime());
            },

            getPhoneCode: function(validateCode) {
                var that = this,
                    params = {
                        phoneNo: $('#l_telphone').val()
                    };
                if (validateCode) {
                    params.validateCodeImg = validateCode;
                }
                $.ajax({
                    url: "/common/sendValidateCode.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.status === "200") {
                            that.startCountDown();
                        } else if (data.status === "-100") {
                            if (data.errorcode === "2084") {
                                that.changeImageBox();
                            } else if (data.errorcode === "2087") {
                               dialog.show({
                                    content: data.errormsg,
                                    buttons: [{
                                        name: "普通登录",
                                        callBack: function() {
                                            that.changeLoginBox('common');
                                            dialog.close();
                                        }
                                    }]
                                });
                            } else {
                                dialog.show({
                                    content: data.errormsg
                                });
                            }
                        }
                    },
                    error: function(data) {

                    }

                });
            },
            checkImageCode: function() {
                var that = this,
                    params = {
                        validateCode: $('#l_imgCode').val()
                    };
                $.ajax({
                    url: "/common/checkValidateCode4Img.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.status === "200") {
                            $('#l_imgCode').css({
                                'border-color': '#dddddd'
                            });
                            that.changeImageBox();
                            that.getPhoneCode($('#l_imgCode').val());
                            that.startCountDown();
                        } else {
                            common.errorDialog(data);
                            $('#l_imgCode').css({
                                'border-color': '#db281f'
                            });
                        }
                    },
                    error: function(data) {

                    }

                });
            },


            startCountDown: function() {
                var that = this,
                    btn = $('#lb_getPhoneCode'),
                    i = 60,
                    countDown = function() {
                        i -= 1;
                        if (i <= 0 || that.needForcedStop) {
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
            loginByPhone: function() {
                var that = this,
                    form = document.forms.loginform,
                    params = {
                        phoneNo: form.telphone.value,
                        validatecode: form.telCode.value
                    };
                if (!form.telphone.value) {
                    dialog.show({
                        content: "请填写手机"
                    });
                    return;
                } else if (!form.telCode.value) {
                    dialog.show({
                        content: "请输入验证码"
                    });
                    return;
                }

                $.ajax({
                    url: "/user/qryUserInfosByPhoneNoVLogin.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.status === "200") {
                            that.needForcedStop = true;
                            that.hasLogined = true;
                            if (data.re.isFind === "1") {
                                $('#ocb_contacts').val(data.re.userInfos.contacts);
                                $('#ocb_contactsmobile').val(data.re.userInfos.contactsmobile);
                            } else if (data.re.isFind === "0") {
                                $('#ocb_contacts').val("");
                                $('#ocb_contactsmobile').val("");
                            }
                            that.isNewCreateUser = data.re.isNewCreateUser;
                            that.plainPassword =data.re.plainPassword || '';

                            common.getUserInfo(function(data){
                                that.getLoginInfo(data)
                            });
                            that.changeLogin(true);
                            
                        } else {
                            dialog.show({
                                content: data.errormsg
                            });
                            $(form.telphone).removeClass('invalid');
                            $(form.telCode).removeClass('invalid');
                        }
                    },

                    error: function(data) {}

                });
            },

            /*登录框判断*/
            loginPass: function() {
                var that = this,
                    form = document.forms.loginform,
                    params = {
                        username: form.username.value,
                        password: form.password.value
                    };
                if (!form.username.value) {
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

                $.ajax({
                    url: "/user/login.htm",
                    data: params,
                    dataType: "json",
                    type: "POST",
                    xhrFields: {
                        withCredentials: true
                    },
                    success: function(data) {
                        if (data.status === "200") {
                            that.hasLogined = true;
                            $('#ocb_contacts').val(data.re.contacts);
                            $('#ocb_contactsmobile').val(data.re.contactsmobile);
                            common.getUserInfo(function(data){
                                that.getLoginInfo(data);
                            });
                            that.changeLogin(true);
                        } else {
                            dialog.show({
                                content: data.errormsg
                            });
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

                    error: function(data) {}

                });
            },
            changeLogin: function(status) {
                if (status) {
                    $('#order_login_box').addClass('olb_disabled');
                    $('#order_login_box input').attr('disabled', true);
                    $('#lb_btnline').hide();
                    $('#order_commit_box').show();
                    $('#lb_toNormalLine').hide();
                    $('#lb_forget').hide();
                    $('#toPhoneLogin').hide();
                    $('#lb_getPhoneCode').addClass('lb_getPhone_disabled');
                }
            },
            changeLoginBox: function(flag) {
                    if (flag === "common") {
                        this.loginSatus = "common";
                        $('#lb_nameLine').show();
                        $('#lb_passwordLine').show();
                        $('#lb_telphoneLine').hide();
                        $('#lb_phoneCodeLine').hide();
                        $('#lb_imgCodeLine').hide();
                        $('#lb_rememberLine').show();
                        $('#lb_submitBtn').text("登录");
                    } else if (flag === "telphone") {
                        $('#lb_nameLine').hide();
                        $('#lb_passwordLine').hide();
                        if (this.onImgCode) {
                            this.loginSatus = "image";
                            $('#lb_telphoneLine').hide();
                            $('#lb_phoneCodeLine').hide();
                            $('#lb_imgCodeLine').show();
                            $('#lb_rememberLine').hide();
                            $('#lb_submitBtn').text("确定");
                        } else {
                            this.loginSatus = "telphone";
                            $('#lb_telphoneLine').show();
                            $('#lb_phoneCodeLine').show();
                            $('#lb_imgCodeLine').hide();
                            $('#lb_rememberLine').show();
                            $('#lb_submitBtn').text("提交");
                        }
                    }
                },
                /*联系人判断*/
            initLogin: function() {
                var that = this;
                common.getUserInfo(function(data) {
                    if (data.isLogin === "0") {
                        $('#order_login_box').show();
                        $('#order_login_box input').removeAttr('disabled');
                    } else if (data.isLogin === "1") {
                        that.hasLogined = true;
                        $('#ocb_contacts').val(data.contacts);
                        $('#ocb_contactsmobile').val(data.contactsmobile);

                        that.contactFlag = data.contacts;
                        that.changeLogin(true);
                        /*如果登录状态*/
                        that.getLoginInfo(data);
                    }

                })

            },
            getLoginInfo : function(data){
                this.commonShow();
                this.mobile = data.mobile || '';
                this.username = data.username || '';
            },
            commonShow : function(){
                    $(".cartlist .order-list").show();
                    $(".cartlist .account ").show();
                    this.initAjax();
                    this.getCardList();
                    this.addressList();
            },
            showMask : function(content,tips){
                var html = [],
                    w  = $(document).width(),
                    h= $(document).height(),
                    content =  content || '购物车已经过期',
                    tips =tips || '后返回',
                    style = "position:fixed;width:"+w+"px;height:"+h+"px;top:0;left:0;z-index:10000001",
                    maskStyle = "position:fixed;width:"+w+"px;height:"+h+"px;top:0;left:0;z-index:10000000;background-color:#000;opacity:.5;filter:alpha(opcity=50)",
                    loadMask = "<div class='loading_mask_div' style='"+maskStyle+"'></div>";


                    html.push("<div class='loading_content' style='"+style+"'>");
                    html.push("<div style='width:320px;position:absolute;left:50%;top:400px;margin-left:-160px;text-align:center;font-size:14px;color:#666666;'>");
                    html.push("<p style='border:1px solid #ccc;border-radius:3px;padding:20px;background-color:#ffffff;'>"+content+"，<i>2</i>秒"+tips+"</p>");
                    html.push("</div>");
                    html.push("</div>");
                    $("body").append(loadMask);
                    $("body").append(html.join(""));
            },
            hideMask : function(){
                $(".loading_content").hide();
                $(".loading_mask_div").hide();
            },
            countDownMaskTimer : null,
            countDownMask : function(callback){
                var that = this,
                    countDownMove = $('.loading_mask i'),
                    i = 2,
                    cb  = callback || function(){
                        window.location.href='/app/cart.html';
                    },
                    countDown = function() {
                        i -= 1;
                        if (i <= 0) {
                            clearTimeout(that.countDownMaskTimer);
                            that.hideMask();
                            cb();
                        } else {
                            countDownMove.html(i);
                            that.countDownMaskTimer= setTimeout(countDown, 1000);
                        }
                    };
                countDown();
                
            },
            /*项目显示*/
            /*初始化*/
            initAjax : function(){
                var that = this;
                var tpl = Handlebars.compile($("#shop-tpl").html()),
                    couponTpl = Handlebars.compile($("#coupon-tpl").html());

                $.ajax({
                    type : "POST",
                    url : "/cart/getMyCart.htm",
                    dataType : "json",
                    data : {
                        showIds :common.getParams("showIds")
                    }
                }).done(function(data){
                    if(data.status == 200){
                        var ret = data.re;

                        if(ret.cartList.length == 0){
                            that.showMask();
                            that.countDownMask();
                            return;
                        }
                        that.$cartlist.empty();
                        that.$cartlist.append(tpl(ret));
                        that.$cartCoupon = ret.cartList;
                        /*获取优惠券*/
                            that.getCoupon(ret.cartList,that.couponid).done(function(data){
                                if(data.status == 200){
                                    var re = data.re;
                                        that.serviceItemInfos =data.re.cartSet;
                                    if(that.couponid){
                                        $(".coupon-list").empty();
                                        $(".coupon-list").append(couponTpl(re));
                                        /*计算总价格*/
                                        that.calculatAmount(data.re.couponIdAllDiscount);
                                    }else{
                                          that.calculatAmount();
                                    }
                                }else{
                                    dialog.show({
                                        content : data.errormsg
                                    })
                                }

                            });
                    }else{
                        dialog.show({
                            content : data.errormsg
                        })
                    }
                })
            },
          /*优惠券组装*/
            getCoupon : function(json,couponids){
                var that = this,
                    tempServicer = json,
                    cartList = [];
                    
                /*组装数组*/
                $.each(tempServicer,function(key,value){

                    var tempItemJson = {},
                        tempJson = {},
                        // type = this["options"][0],
                        // options = this["options"][0]["options"],
                        items = value["items"];

                        tempJson.services = [];
                        tempJson.province = value["provincecode"];
                        tempJson.city = value["citycode"];
                        tempJson.district = value["districtcode"];
                        tempJson.servicername = value["srname"];
                        tempJson.servicerid = value["srid"];
                        

                    $.each(items,function(key,value){
                        var sdid = value["sdid"],
                            itemgroupid = value["itemgroupid"],
                            serviceItemId = value["siid"],
                            id = value["id"];

                        if(!tempItemJson[sdid]){
                            tempItemJson[sdid] = {};
                        }

                        tempItemJson[sdid].serviceid= value["sdid"];
                        tempItemJson[sdid].servicename= value["sdname"];

                        if(!tempItemJson[sdid][itemgroupid]){
                            tempItemJson[sdid][itemgroupid] = {};
                        }
                        tempItemJson[sdid][itemgroupid].groupname = value["itemgroupname"];
                         tempItemJson[sdid][itemgroupid].groupid = value["itemgroupid"];
                         tempItemJson[sdid][itemgroupid].paytype = value["paytype"];
                         tempItemJson[sdid][itemgroupid].account = value["account"];

                         if(!tempItemJson[sdid][itemgroupid][id]){
                            tempItemJson[sdid][itemgroupid][id] = {};
                         }
                         tempItemJson[sdid][itemgroupid][id].serviceItemId =value["siid"];
                         tempItemJson[sdid][itemgroupid][id].buynum =value["quantity"];
                         tempItemJson[sdid][itemgroupid][id].price =value["price"];
                         tempItemJson[sdid][itemgroupid][id].servicerServicesid =value["srsid"];
                         tempItemJson[sdid][itemgroupid][id].selectedOpts=[];


                         if(value["options"].length){
                            var optionVal = value["options"];

                                $.each(optionVal,function(k2,v2){

                                    tempItemJson[sdid][itemgroupid][id].selectedOpts.push({
                                            type  :v2["type"],
                                            name : v2["specdefinename"],
                                            content : []
                                        });

                                })


                                var index = 0;
                                $.each(optionVal,function(k3,v3){
                                    var tempArr = [];
                                    $.each(v3['options'],function(k4,v4){
                                        var selectFlag = true;
                                        $.each(v3['options'],function(k5,v5){
                                            if(v5['isSeleceted'] == 1){
                                                selectFlag = false;
                                            }
                                        })
                                        if(selectFlag){
                                            tempArr.push(v3['options'][0]['optionname']);
                                            return false;
                                        }else{
                                           if(v4['isSeleceted'] == 1){
                                                tempArr.push(v4['optionname']);
                                             } 
                                        }

                                    })
                                    /*选中规格*/
                                    tempItemJson[sdid][itemgroupid][id].selectedOpts[index].content=tempArr.join(",");
                                        index++;
                                })

                                           

                         }

                    })

                        $.each(tempItemJson,function(k1,v1){
                            var cartJson = {};
                            var index = 0;
                            cartJson.serviceid = v1["serviceid"];
                            cartJson.servicename = v1["servicename"];
                                cartJson.itemgroups = [];
                                $.each(v1,function(k2,v2){
                                    if($.type(v2) == "object"){
                                        cartJson.itemgroups.push({
                                            groupname:v2["groupname"],
                                            groupid:v2["groupid"],
                                            account:v2["account"],
                                            paytype:v2["paytype"],
                                            items : []
                                        });


                                        var tempJson = [];
                                        $.each(v2,function(k3,v3){
                                            if($.type(v3) == "object"){
                                                tempJson.push({
                                                    buynum: v3["buynum"],
                                                    price :v3["price"],
                                                    serviceItemId :v3["serviceItemId"],
                                                    servicerServicesid :v3["servicerServicesid"],
                                                    selectedOpts : v3["selectedOpts"]
                                                });
                                            }
                                        });
                                        cartJson.itemgroups[index].items = tempJson;
                                        index++;
                                    }
                                });
                            
                            tempJson.services.push(cartJson)
                            
                        })
                    
                    /*组装数组*/
                    cartList.push(tempJson);

                });
                
                
                /*购物车优惠券数据*/

                var tpl = Handlebars.compile($("#coupon-tpl").html());


                var deferred = $.ajax({
                    type : "POST",
                    url : "/cart/getMyCoupon.htm",
                    dataType : "json",
                    data : {
                        cartList : JSON.stringify(cartList),
                        couponids :couponids
                    }
                }).fail(function(){
                    that.dialog.show({
                        content : "系统繁忙,请稍后再试"
                    })
                });
                return deferred;
            },
             /*计算总价格*/

             initDisable : function(){

                    this.oSubmitBtn.prop("disabled","disabled");
             },
            calculatAmount : function(discount){
                var item = $(".cart-list li"),
                    sumPrice= $(".sum-price i"),
                    marketPrice= $(".market-price i"),
                    totalRePrice= $(".reduce-price i"),
                    iAmount = 0,
                    totalDiscount = discount ? discount : 0;
                    $.each(item,function(){
                        var $this = $(this),
                            quantity = parseFloat($this.find("[data-quantity]").attr("data-quantity")),
                            price = parseFloat($this.find("[data-price]").attr("data-price"));

                                iAmount += quantity*price;


                    });

                totalRePrice.html(Number(totalDiscount).toFixed(2));
                marketPrice.html(iAmount.toFixed(2)); 
                sumPrice.html((iAmount-totalDiscount).toFixed(2));
                this.oSubmitBtn.addClass('active').removeProp('disabled');


            },
            /*获取帐号下的卡劵*/
            getCardList : function(){
                var tpl = Handlebars.compile($("#card-tpl").html());
                $.ajax({
                    url : "/user/qryMyCouponCardList.htm",
                    dataType : "json",

                }).done(function(data){
                    if(data.status == 200){
                        $("select").chosen();
                        $(".coupon .chosn_options").append(tpl(data.re));
                    }else{
                        dialog.show({
                            content : data.errormsg
                        })
                    }
                })
            },

            /*获取优惠*/
            getMyCoupon : function(obj){
                var that = this,
                    ids = [],
                    couponid = $("[data-couponid]"),
                    couponsetElem =$(".coupon .couponset") ,
                    cardid = $(".coupon select option:checked");
                    if(couponid.length){
                        ids.push(couponid.attr("data-couponid"));
                    }
                    if(cardid.length){
                        ids.push(cardid.attr("data-cardid"));
                    }


                    if(ids.length == 0){
                        ids = "";
                    }else if(ids.length == 1){
                        ids = ids.toString();
                    }else{
                        ids = ids.join(",");
                    }

                /*调用优惠券接口*/
                this.getCoupon(this.$cartCoupon,ids).done(function(data){
                            if(data.status == 200){
                                /*计算总价格*/
                                var result = data.re,
                                    couponsetPrice = (parseFloat(result.couponIdAllDiscount)-($("[data-discount]").attr("data-discount")?parseFloat($("[data-discount]").attr("data-discount")):0)).toFixed(2),
                                    
                                    showCouponSet = result.showCouponSet,
                                    flag = false;
                                that.calculatAmount(result.couponIdAllDiscount);

                                that.serviceItemInfos = result.cartSet;
                                /*that.calculatAmount(data.re.showCouponSet[0].discount);*/
                                // 否是显示为你节省多少钱

                                $.each(showCouponSet,function(k,v){
                                    if(v.id == $(".coupon select option:selected").attr("data-cardid") && v.isReach){
                                        flag = true;
                                    }

                                })

                                if(flag){

                                    couponsetElem.html("为您节省：￥<i>"+couponsetPrice+"</i>").show();
                                }else{
                                    couponsetElem.html("您未满足使用此张优惠券的条件").show();
                                }

                            }else{
                                dialog.show({
                                        content : data.errormsg
                                    })
                            }

                        });
            },
            /*兑换码*/
            noCardAmount : function(){
                var couponDiscount = $("[data-discount]").attr("data-discount")?parseFloat($("[data-discount]").attr("data-discount")) : 0;

                this.calculatAmount(couponDiscount);




            },
            activeMyCard : function(){

                var that =this,
                    cardList = $(".coupon .chosn_options"),
                    html = "",
                    activateCode = $.trim($("[name='exchage-code']").val());
                if(activateCode ===''){

                    dialog.show({
                        content : "请输入兑换码"
                    })
                    return;
                }
                $.ajax({
                    type : "POST",
                    url : "/user/activeMyCouponCard.htm",
                    dataType : "json",
                    data : {
                        activateCode : activateCode
                    }
                }).done((function(data){
                    if(data.status == 200){
                        var re = data.re;
                        dialog.show({
                            content : "兑换成功，请看卡/券 "
                        });
                        html = '<option value="'+re.myCardConsumeId+'" data-consumeid="'+re.myCardConsumeId+'" data-cardid="'+re.couponCardId+'">'+re.couponCardName+'</option>';
                        cardList.append(html);

                    }else{
                        dialog.show({
                            content : data.errormsg
                        })
                    }
                }))
            },
            createOrder : function(){   
                var that = this,
                    param = {},
                    amount = $(".market-price i").text(),
                    couponId=$("[data-couponid]").length? ($("[data-isreach]").attr("data-isreach")=="true"? $("[data-couponid]").attr("data-couponid"):""):"",
                    contacts = $(".fill_contact").is(":visible")?$.trim($("#ocb_contacts").val()):$("#contactlist dd.active .position span").text(),
                    contactsmobile = $(".fill_contact").is(":visible")?$.trim($("#ocb_contactsmobile").val()):$("#contactlist dd.active .phone").text(),
                    myCardConsumeId = $(".couponset i").length ? ($(".coupon select option:checked").attr("data-consumeid")?$(".coupon select option:checked").attr("data-consumeid"):""):"",
                    ocb_contacts = $("#ocb_contacts"),
                    ocb_contactsmobile = $("#ocb_contactsmobile"),
                    myCardCouponId =  $(".couponset i").length ? ($(".coupon select option:checked").attr("data-cardid")?$(".coupon select option:checked").attr("data-cardid") : ""):"",
                    fee =0,
                    sourceid = 10,
                    sourcememo ='网站',
                    giftCardIdsDirect = [],
                    willGift = [],
                    giftIDs = [],
                    willGiftIds = [],
                    serviceItemInfos =this.serviceItemInfos;

                    if(common.getParams("giftIds")){
                        giftCardIdsDirect=common.getParams("giftIds");
                        giftCardIdsDirect = giftCardIdsDirect.split(",");

                        willGift = common.getParams("willGift");
                        willGift = willGift.split(",");

                        $.each(giftCardIdsDirect,function(key,value){
                            giftIDs.push(Number(value));
                        });
                        $.each(willGift,function(key,value){
                            willGiftIds.push(Number(value));
                        })
                    }
                    /*判断联系人*/
                    if($.trim(ocb_contacts.val()) ===""){
                        dialog.show({
                            content : "请输入联系人"
                        });
                        ocb_contacts.focus();
                        return;
                    }

                    if($.trim(ocb_contactsmobile.val()) ===""){
                        dialog.show({
                            content : "请输入联系人手机号码"
                        });
                        ocb_contactsmobile.focus();
                        return;
                    }
                     if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test($.trim(ocb_contactsmobile.val()))) {
                        dialog.show({
                            content : "请输入正确的手机号码"
                        });
                        return;
                    }


                    if(giftIDs.length){
                       param = {
                            platform : 1,
                            giftCardIdsDirect : JSON.stringify(giftIDs),
                            theseCouponsWillGitfOthers : JSON.stringify(willGiftIds),
                            amount : amount,
                            couponId : couponId,
                            contacts : contacts,
                            contactsmobile : contactsmobile,
                            myCardConsumeId : myCardConsumeId,
                            myCardCouponId : myCardCouponId,
                            fee :fee,
                            sourceid : sourceid,
                            sourcememo :sourcememo,
                            serviceItemInfos : JSON.stringify(serviceItemInfos)
                        }; 
                    }else{
                        param = {
                            platform : 1,
                            amount : amount,
                            couponId : couponId,
                            contacts : contacts,
                            contactsmobile : contactsmobile,
                            myCardConsumeId : myCardConsumeId,
                            myCardCouponId : myCardCouponId,
                            fee :fee,
                            sourceid : sourceid,
                            sourcememo :sourcememo,
                            serviceItemInfos : JSON.stringify(serviceItemInfos)
                        };
                    }



                    $.ajax({
                            type : "POST",
                            url : "/cart/deleteMyCart.htm",
                            dataType : "json",
                            data : {
                                ids : common.getParams("showIds"),
                                isNeedLogin : '1'
                            }
                        }).done(function(data){
                            if(data.status == 200){

                                $.ajax({
                                    type : "POST",
                                    url : "/user/createOrder170.htm",
                                    dataType : "json",
                                    data : param
                                }).done(function(data){
                                    if(data.status == 200){

                                        var param = {},
                                            re = data.re;

                                        
                                        if(!that.isNewCreateUser){
                                            if(re.needSetPwd == 0){

                                                param = {
                                                    needSetPwd :re.needSetPwd,

                                                }
                                            }else{
                                                param = {
                                                needSetPwd :re.needSetPwd,
                                                mobile : that.mobile,
                                                username :that.username

                                                }
                                            }
                                        }else{
                                            param = {
                                                needSetPwd :re.needSetPwd,
                                                mobile : that.mobile,
                                                username :that.username,
                                                plainPassword :that.plainPassword

                                            }
                                        }
                                        /*下单成功跳转*/

                                        if($(".fill_contact").is(":visible")){
                                            if(that.contactFlag !==''){
                                                that.beforeCreateOrder(function(){

                                                 window.location.href = "/app/getorder.html?"+$.param(param);
                                                });
                                            }else{
                                                window.location.href = "/app/getorder.html?"+$.param(param);
                                            }
                                            
                                        }else{
                                            window.location.href = "/app/getorder.html?"+$.param(param);
                                        }



                                    }else{
                                        dialog.show({
                                            content : data.errormsg
                                        });
                                        

                                    }
                                })

                            }else{
                                    // dialog.show({
                                    //     content : data.errormsg
                                    // })

                                    if(data.errorcode ==='3000'){
                                        that.showMask('用户未登录','返回登录界面');
                                        that.countDownMask(function(){
                                            window.location.reload();
                                        });
                                    }else{

                                        that.showMask();
                                        that.countDownMask();
                                    }
                
                                }
                            })

            },

            beforeCreateOrder : function(callback){
                    var that =this,

                    username = $.trim($("#ocb_contacts").val()),
                    mobile = $.trim($("#ocb_contactsmobile").val()),
                    params = {
                        name : username,
                        mobile : mobile,
                        companyid : -1,
                        isdefault : '1',
                    },


                    request = new Ajax('/user/newAddContact.htm',params);

                    request.done(function(data){
                        if(data.status === '200'){
                            typeof callback ==="function" && callback();
                            
                        } else {
                            common.errorDialog(data);
                        }
                    })
            },
            /*自定义helper*/
            registerHHelper: function() {

                    /*计算每个的总价格*/

                    Handlebars.registerHelper("toAmount", function(q,p, options) {

                        return parseFloat(q)*parseFloat(p);
                    });

                    Handlebars.registerHelper("removeHttp", function(value, options) {


                        return value.replace('http:','');
                    })

                    Handlebars.registerHelper("toSelect", function(value, options) {
                        if(value.isSeleceted == 1){

                            return value.optionname;
                        }
                    })

                    /*付款方式*/
                    Handlebars.registerHelper("toPayTypes", function(value, options) {

                        var type = value.split(","),
                            html = [],
                            payJson = {};
                        $.each(type,function(key,value){
                            var typeVal = "";
                            switch (value) {
                            case "0":
                                typeVal =  "普通按次付";
                                break;
                            case "1":
                                typeVal =  "月付";
                                break;
                            case "2":
                                typeVal =  "季付";
                                break;
                            case "3":
                                typeVal = "半年付";
                                break;
                            case "4":
                                typeVal = "年付";
                                break;
                            }

                            html.push(options.fn({
                                type : key,
                                value : typeVal
                            }))
                        })

                        return html.join("");

                    });

                    Handlebars.registerHelper("toDefaultType", function(value, options) {
                        /*付款方式*/
                            var typeVal = "";
                            switch (value.toString()) {
                            case "0":
                                typeVal =  "普通按次付";
                                break;
                            case "1":
                                typeVal =  "月付";
                                break;
                            case "2":
                                typeVal =  "季付";
                                break;
                            case "3":
                                typeVal = "半年付";
                                break;
                            case "4":
                                typeVal = "年付";
                                break;
                            }

                        return typeVal;
                    });

                    var radioIndex = 0,
                        checkboxIndex = 0;

                    Handlebars.registerHelper("toType", function(value, options) {
                        var optionArr = this.options[0].options,
                            radioname = "radio"+radioIndex,
                            checkboxname = "chekcbox"+checkboxIndex,
                            html = "";
                        if(value == 1){
                            $.each(optionArr,function(key,value){
                                var checked = "";
                                if(key == 0){
                                    checked="checked";
                                }
                                html += options.fn({
                                    optionname : value["optionname"],
                                    price : value["price"],
                                    unit : value["unit"],
                                    radioname : radioname,
                                    checked : checked
                                })
                            });
                            radioIndex++;
                        }else if(value == 2){
                             $.each(optionArr,function(key,value){
                                var checked = "";
                                if(key == 0){
                                    checked="checked";
                                }
                                html += options.inverse({
                                    optionname : value["optionname"],
                                    price : value["price"],
                                    unit : value["unit"],
                                    checkboxname : checkboxname,
                                    checked : checked
                                });
                            })
                                html +='<p class="btn btn-primary">确定</p>';
                                checkboxIndex++;
                        }
                            
                            return html;

                    })

                    Handlebars.registerHelper("unReach", function(value, options) {
                        var tips = this["tips"],
                            type = "";
                        switch (this.resultType) {
                            case "0":
                                type = "赠券";
                                break;
                            case "1":
                                type = "折扣";
                                break;
                            case "2":
                                type = "直减";
                                break;
                            case "3":
                                type = "一口价";
                                break;
                            }
                        if(value == false){
                            return options.fn({
                                tips : tips,
                                type : type
                            });
                        }
                    })

                    Handlebars.registerHelper("couponType", function(value, options) {
                        switch (value) {
                            case "0":
                                return "赠券";
                                break;
                            case "1":
                                return "折扣";
                                break;
                            case "2":
                                return "直减";
                                break;
                            case "3":
                                return "一口价";
                                break;
                            }
                    })

                    Handlebars.registerHelper("toShow", function(value, options) {
                            if(this.isReach){
                                    return options.fn({
                                        discount  : value.couponIdAllDiscount

                                    })
                                }else{
                                    return options.inverse(this);
                                } 
                            
                           
                    })
                }

        }


        new Cartlist;
    });
}(window.requirejs));
