/**
 * Created by Administrator on 2016/1/3 0003.
 */
!function(requirejs){
    'use strict';

    requirejs(['jquery','ajax', 'common','superSlide','formVerified', 'dialog', 'info','addressBox','dial','handlebars','share','placeholder','message'],function($,Ajax,common,superSlide,FormVerified, dialog, info,addressBox,dial,Handlebars,share,placeholder,Message){
        var Shop = function(){
            this.$shopIntro = $(".shop-intro");
            this.$toggle = $(".service .toggle");
            this.$couponTips = $(".coupon-tips");
            this.$seek = $(".amount .seek");
            this.$likeBtn = $("#tab-like .btn-like");
            this.$succssBtn = $("#tab-like .success");
            this.$noPrice = $(".btn-noprice");
            this.$change = $(".amount .change");
            this.$collect = $('#sp-collectBtn');
            this.$buyDialog = $("#next-dialog .next-popover");
            this.$buyBtn = $(".des .btn-shop");
            this.$detailInfo = $("#coupon-info .coupon-popover");
            this.info = info;
            this.init();
        };

        Shop.COUPON = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        Shop.prototype = {
            init : function(){
                var that =this;
                /*服务商出现效果*/
                this.shopIntro();
                this.slideBoardcast();
                this.listener();
                

            },
            listener : function(){
                var that = this;
                /*$('.btn-shop').on("click", function() {
                    addressBox.show(this);
                });*/

                /*placeholder*/
                $("#comment-form :input").placeholder();

                /*提交点选评价*/

                new FormVerified(document.getElementById('comment-form'), function () {
                                // that.editPurpose();
                                that.postComment();
                            });

                $(".service-list .like .cancel").on("click",function(){
                    that.cancelComment();
                })
                new FormVerified(document.getElementById('sendmessage-form'), function () {
                                // that.editPurpose();
                                that.formPost();
                            });
                /*前往购买*/
                this.$buyBtn.on("click",function(){
                        that.buyDialog(this);
                    })
                $(document).on("click", ".next-popover .rechose", function() {

                    that.info.close();
                });
                $(document).on("click", ".next-step", function() {
                    that.buyPost(this);
                });

                /*tab效果*/
                $('.shop-intro [data-spy="tab"]').tab({
                    autoPlay:false,
                    callback: function (active) {
                        if (active.attr('data-target') === "intro-list") {
                            that.introDetailCtrl();
                        }
                        //console.log("done");
                    }
                });
                $('[data-spy="superSlide"]').superSlide({
                    showArrow:false
                });
                /*区域效果*/
                this.$toggle.on("click",function(){
                    that.showAddress(this);
                });
                /*优惠效果*/
                this.$couponTips.on("click",function(){
                    that.queryDetail(this);
                    
                });
                this.$seek.on("click",function(){
                    var txt = $(this).html(),
                        oTip = $(this).parents(".des").find(".coupon-tips");
                    if(txt=='收起详情'){

                        that.collapse(this);
                    }else{
                        that.queryDetail(oTip);
                    }
                });

                /*点赞*/
                this.$likeBtn.on("click",function(){
                    that.likeComment(this);
                });
                /*弹出没有报价切换选区*/
                this.$noPrice.on("click",$.proxy(this.showRegion,this));

                $('#intro-list').on('click', 'a[data-role="showBtn"]', function () {
                    $('#intro-list div[data-role="content"]').css({
                        height: "auto"
                    });

                    $('#intro-list a[data-role="showBtn"]').hide();
                });

                this.$collect.on('click', function () {
                    if (common.userInfo.isLogin === "0") {
                        dialog.show({
                            content: "登录后才能收藏服务商",
                            buttons: [{
                                    name: "立即登录",
                                    callBack: function () {
                                        dialog.close();
                                        window.location.href = "/app/login.html";
                                    }
                                },{
                                    name: "暂不收藏",
                                    callBack: function () {
                                        dialog.close();
                                    }
                                }]
                        });
                        return;
                    }
                    if ($(this).hasClass('active')) {
                        that.delCollectServicer(this);
                    } else {
                        that.addCollectServicer(this);
                    }
                });

                // Coupon

                $('.coupon-list').on('click', 'a[data-role="getCoupon"]', function () {
                    that.getCoupon(this);
                });

                $('.coupon-list').on('click', 'a[data-role="showAllSp"]', function (evt) {
                    var $target = $(evt.target);

                    that.updateSpList($target.data('cptype'), $target.data('tips'), $target.data('list'));

                    that.info.show({
                        content: that.$detailInfo
                    });
                });

                $(document).on("click", ".close-dialog", function() {
                    that.info.close();
                });

                $(".service-content .notice p").on("click",function(){
                    that.getNoticeTab(this);
                });
                //专家激活
                this.expertActive();

                //全部服务区域

                this.showAreaBtn();
            },


            showAreaBtn : function(){
                var areaContent = $(".area i");

                    $.each(areaContent,function(){
                        if($(this).outerHeight(true) <=50){
                            $(this).next().hide();
                        }
                    })

            },
            expertActive:function(){

                var expert = common.getParams("expert"),
                    expertList = $('[data-target="expert-list"]'),
                    expertId = $("#expert-list"),
                    powerList = $('[data-target="power-list"]'),
                    powerId = $("#power-list");

                if(expert !=='' && expertList.length ){
                    powerList.removeClass("active");
                    powerId.removeClass("active");
                    expertId.addClass("active");
                    expertList.addClass('active');
                }
            },

            slideBoardcast : function(){
                var boardcastWidth = $('.boardcast-list').outerWidth(),
                    oBoardcast = $(".boardcast-list"),
                    oPwidth = oBoardcast.prev("p").outerWidth(true),
                    oUl = $('.boardcast-list ul'),
                    initLi = oUl.children("li"),
                    initLiWidth = 0,
                    aLi =null,
                    active = null,
                    oTimer = null,
                    totalWidth = 0,

                    oUlWidth = 0;

                    /*分配宽度*/
                    oBoardcast.css({
                        "width":1210-oPwidth
                    })

                    $.each(initLi,function(){
                        initLiWidth +=$(this).outerWidth(true);
                    })
                    if(initLiWidth < boardcastWidth){
                        return;
                    }

                    oUl.html(oUl.html()+oUl.html());


                    aLi = oUl.children('li');
                    active = aLi.first();

                    $.each(aLi,function(){

                        oUlWidth += $(this).outerWidth(true);
                    });


                    oUlWidth +=1;
                    oUl.css("width",oUlWidth);

                var slide = function(){
                    totalWidth +=active.outerWidth(true);

                    oUl.animate({
                        'marginLeft' : -totalWidth
                    },function(){

                        if(totalWidth >= oUlWidth/2){
                            oUl.css("marginLeft",0);
                            active = aLi.first();
                            totalWidth = 0;
                        }else{
                            
                            active = active.next();
                        }

                    });
                };

                //轮询
               oTimer = setInterval(function(){
                    slide();
                },3000)

                oUl.hover(function(){
                    clearInterval(oTimer);
                    },function(){
                        oTimer = setInterval(function(){

                        slide();
                    },3000)
                })
            },



            getNoticeTab : function(obj){
                var that = this,
                    $this = $(obj),
                    option = $this.attr("data-option"),
                    $parent = $this.parents(),
                    $config = $.parseJSON($parent.attr("data-config")),
                    html = [],
                    params = {
                        serviceId :$config['id'],
                        serviceName : $config['name'] 
                    },
                    request = new Ajax('/servicer/qryAjaxNotice.htm',params);

                    request.done(function(data){
                        if(data.status === '200'){
                            var attentions = data.re.attentions,
                                commonPromblems = data.re.commonPromblems,
                                attentionTemp = [],
                                commonPromblemsTemp = [],
                                logo = '';

                                $.each(attentions,function(k,v){
                                    switch(v['spec']){
                                        case '名':
                                        logo = 'ming';
                                        break;

                                        case '地':
                                        logo = 'di';
                                        break;

                                        case '银':
                                        logo = 'yin';
                                        break;

                                        case '税':
                                        logo = 'shui';
                                        break;
                                        default :
                                        logo = '';
                                    }
                                    attentionTemp.push("<li>");
                                    attentionTemp.push("<p><i class='"+logo+"'>"+v['spec']+"</i>"+v['name']+"</p>");
                                    attentionTemp.push("<p class='detail'>"+v['description']+"</p>");
                                    attentionTemp.push("</li>");
                                })
                            
                                $.each(commonPromblems,function(k,v){
                                    commonPromblemsTemp.push("<li>");
                                    commonPromblemsTemp.push("<p><i class='circle'>?</i>"+v['name']+"</p>");
                                    commonPromblemsTemp.push("<p class='detail'>"+v['description']+"</p>");
                                    commonPromblemsTemp.push("</li>");
                                })


                            html.push("<div class='ajaxTab'>");
                            html.push("<ul class='tab-head clearfix'>");
                                html.push("<li class='"+(option === "0" ? "active": "")+"'>购买"+$config['name']+"的注意事项</li>");
                                html.push("<li class='"+(option === "1" ? "active": "")+"'>购买"+$config['name']+"的常见问题</li>");
                            html.push("</ul>");
                            html.push("<div class='tab-body'>");
                                html.push("<div class='"+(option === "0" ? "active": "")+"'>")
                                html.push("<ul>");
                                html.push(attentionTemp.join(""));
                                html.push("</ul>");
                                html.push("</div>")
                                html.push("<div class='"+(option === "1" ? "active": "")+"'>")
                                html.push("<ul>");
                                html.push(commonPromblemsTemp.join(""));
                                html.push("</ul>");
                                html.push("</div>")
                            html.push("</div>");
                        html.push("</div>");

                        info.show({
                            content : html.join("")
                            })
                        };


                        that.NoticeTabEvent();
                })

            },

            NoticeTabEvent : function(){
                var aLi = $(".ajaxTab .tab-head li"),
                    aDiv = $(".ajaxTab .tab-body >div");

                    aLi.on("click",function(){
                        var index = $(this).index();
                        aLi.removeClass("active");
                        $(this).addClass("active");
                        aDiv.hide();
                        aDiv.eq(index).show();
                    })

            },  

            introDetailCtrl: function () {
                $('#intro-list div[data-role="content"]').each(function () {
                    if (this.scrollHeight <= 60) {
                        $(this).css({'height': 'auto'}).find('a[data-role="showBtn"]').hide();
                    }
                });
            },


            formPost: function() {
                var that = this,
                    addressValue = $("#pc-district").attr("data-value");
                /*send form data*/
                var params = {
                    comments: $.trim($("#sendmessage-form textarea").val()),
                    title: $.trim($("#sendmessage-form [name='username']").val()),
                    tel: $.trim($("#sendmessage-form [name='phone']").val()),
                    sdcat1: "-1",
                    sourcetype: 40
                }


                dialog.show({
                    content: "<div class='info-loading'>处理中，请稍后</div>"
                });

                $.post('/servicer/addPurpose.htm', params, function(data) {
                    dialog.close();
                    if (data.status === "200") {
                        var id = data.re.id,
                            message = new Message();

                            message.show(id,function(){
                                    /*回调清空数据*/
                                    $("#sendmessage-form textarea").val("");
                                    $("#sendmessage-form [name='username']").val("");
                                    $("#sendmessage-form [name='phone']").val("");

                            });
                       
                    } else {
                        dialog.show({
                            content: data.errormsg
                        });
                    };
                });
            },

            /*前往购买弹框*/
            buyDialog: function(obj) {
                var that = this,
                    $this = $(obj),
                    html = [];
                    addressBox.show(obj,function(){
                    var $addressTxt = $this.next().text();
                        html.push('<div class="next-popover">');
                        html.push('<div class="confirm">');
                        html.push('<h3>您已选择服务区域：<span id="next-district">'+$addressTxt+'</span></h3>');
                        html.push('<p><span class="btn btn-warning next-step"  data-value="'+$this.attr("data-value")+'" data-serviceid="'+$this.parents(".des").attr("data-serviceid")+'" data-categoryid="'+$this.attr("data-categoryid")+'">前往购买</span></p>');
                        html.push('<p><em id="next-box" class="rechose">重新选择</em></p>');
                        html.push('</div>');
                        html.push('</div>');
                        that.info.show({
                            content: html.join("")
                        });
                    });

            },
            buyPost : function(obj){
                
                var $this = $(obj),
                    serviceid = $this.attr("data-serviceid"),
                    servicerid = $("[data-srid]").attr("data-srid"),
                    addressValue = $this.attr("data-value").split(","),
                    province = addressValue[0],
                    city = addressValue[1],
                    district = addressValue[2],
                    categoryid = $this.attr("data-categoryid"),
                    param = {};
                    param = {
                        province : province,
                        city :city ,
                        district : district,
                        serviceid  :serviceid,
                        servicerid :servicerid,
                        categoryid : categoryid

                    }
                    window.location.href = "/servicer/servicerGotoChoosePage4Jsp.htm?"+$.param(param);
            },
            shopIntro : function(){
                this.$shopIntro.animate({
                    left : 0
                },1500);
            },
            showAddress: function(obj){
                var $this = $(obj),
                    $parent = $this.parent('.area');
                if($parent.hasClass('active')){
                    $this.html("全部服务区域");
                    $parent.removeClass('active');
                }else{
                    $this.html("收起服务区域");
                    $parent.addClass('active');
                }
            },
            sperate : function(obj){
                var $this = $(obj),
                    $collapse = $this.prev().find(".collapse"),
                    $seek = $this.parents(".des").find(".seek");

                    $this.hide();
                    $seek.html('收起详情');
                    $collapse.stop().slideDown();

            },
            collapse : function(obj){
                var $this = $(obj),
                    $collapse = $this.parents('.des').find(".collapse"),
                    $counponTips = $this.parents('.des').find(".coupon-tips");
                    $collapse.stop().slideUp();
                    $counponTips.show();
                    $this.html('查看详情');
            },
            likeComment : function(obj){
                var $this = $(obj),
                    $likeIcon = $this.prev(),
                    $list = $this.parent().next(),
                    $listHeight = $list.outerHeight(),
                    $form = $this.parent().siblings("form"),
                    $formHeight = $this.parent().siblings("form").outerHeight(),
                    $tabLike = $("#tab-like"),
                    $tabLikeHeight = $tabLike.outerHeight();
                    $likeIcon.addClass("active");
                    $this.hide();

                    // this.$succssBtn.show();
                    $this.parent().append('<span class="success">成功点赞</span>');


                    if($formHeight > $listHeight){
                        $tabLike.height($tabLikeHeight+($formHeight-$listHeight));
                    }
                    $form.show().animate({
                        top:208
                    },function(){
                        $list.addClass('active');
                    });
            },
            postComment :function(){
                var that = this,
                    params = {
                        servicerid: $('[data-srid]').attr("data-srid"),
                        message : $.trim($("#comment-form [name='comment']").val()),
                        name:$.trim($("#comment-form  [name='username']").val())
                    },
                    request = new Ajax('/servicer/servicerLike.htm', params);

                    request.done(function(data){
                        if (data.status === "200") {
                            that.getComment();
                        } else {
                            common.errorDialog(data);
                        }
                    })
                    
            },
            cancelComment : function(){
                var that = this,
                    params = {
                        servicerid: $('[data-srid]').attr("data-srid")
                    },
                    request = new Ajax('/servicer/servicerLike.htm', params);

                    request.done(function(data){
                        if (data.status === "200") {
                            that.getComment();
                        } else {
                            common.errorDialog(data);
                        }
                    })
            },
            getComment : function(){
                var $comment = $("#comment-form"),
                    $list = $comment.prev(),
                    params = {
                        servicerid: $('[data-srid]').attr("data-srid")
                    },
                    request = new Ajax('/servicer/servicerLike4Ajax.htm', params);



                    request.done(function(data){
                        if (data.status === "200") {
                            /*清空*/
                            $("#comment-form [name='comment']").val("");
                            $("#comment-form  [name='username']").val("");

                            var tpl = Handlebars.compile($("#like-tpl").html());

                                $("#list-show").html(tpl(data.re));
                            /*切换效果*/
                            $comment.animate({
                                top:34
                            },function(){
                                $(this).hide();
                                $list.removeClass('active');
                            });

                        }else{
                            common.errorDialog(data);
                        }
                    })
            },
            postMsg : function(){

            },
            showRegion : function(){
                this.$change.show(600);
            },

            addCollectServicer: function (obj) {
                var that = this,
                    params = {
                        servicerId: $(obj).parents("[data-srid]").attr('data-srid')
                    },
                    request = new Ajax('/user/addMyCollectServicer.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(obj).addClass('active');
                        $(obj).html('<i class="fav-icon"></i>取消收藏');
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            delCollectServicer: function (obj) {
                var that = this,
                    params = {
                        servicerId: $(obj).parents("[data-srid]").attr('data-srid')
                    },
                    request = new Ajax('/user/delMyCollectServicer.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(obj).removeClass('active');
                        $(obj).html('<i class="fav-icon"></i>收藏服务商');
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            queryDetail: function (obj) {
                var that = this,
                    list = $(obj).prev().find(".coupon-list"),
                    i = 0,
                    length = 0,
                    html = [],
                    params = {
                        id: $(obj).attr('data-id'),
                        spid: $(obj).attr('data-spid')
                    },
                    request = null;
                if ($(obj).attr('data-status') && $(obj).attr('data-status') === "hasLoad") {
                    this.sperate(obj);
                    return;
                }    
                request = new Ajax('/service/qryServiceProvidersServiceRelatedDetails.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(obj).attr('data-status', 'hasLoad');
                        html.push('<div class="description">'+data.re.description+'</div>');
                        if (data.re.cupons.length) {
                            for (i = 0, length = data.re.cupons.length; i < length; i += 1) {
                                html.push('<p>');
                                html.push('<em>' + Shop.COUPON[data.re.cupons[i].itype] +'</em>');
                                html.push(data.re.cupons[i].tips);
                                html.push('</p>');
                            }
                            list.empty().append(html.join(''));
                        } else {
                            list.empty().append('<p>该服务暂无优惠卡券</p>');
                        }
                        that.sperate(obj);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },
            showLoginDialog: function (msg){
                dialog.show({
                    content: msg || '请先登录',
                    buttons: [
                        {
                            name: '马上登录',
                            callBack: function(){
                                window.location.href = '/app/login.html';
                            }
                        },
                        {
                            name: '取消',
                            callBack: function(){
                                // return;
                                dialog.close();
                            }
                        }
                    ]
                });
            },

            getCoupon: function (obj) {
                var that = this;

                // Check if is logged in
                common.getUserInfo(function(data){
                    // Not logged in
                    if (Number(data.isLogin) === 0){
                        that.showLoginDialog();

                    // Logged in
                    } else {
                        var params = {
                           couponsIds: $(obj).attr('data-value') 
                        },
                        request = new Ajax('/user/fetchCouponsIds.htm', params);
                        request.done(function (data) {
                            if (data.status === '200') {
                                dialog.show({
                                    content: '领取成功'
                                });
                                // that.queryCouponList();
                                window.location.reload();

                            } else {
                                // 1034: 会话已失效
                                if (data && Number(data.errorcode) === 1034)
                                    that.showLoginDialog(data.errormsg);
                                else {
                                    common.errorDialog(data);
                                }
                            }
                        });
                    }
                });

            },

            writeCouponList: function (data) {
                var that = this,
                    list = $('#qf-couponList'),
                    html = "",
                    couponName = "",
                    i = 0,
                    length = 0,
                    items = [],
                    item = null,
                    source = $('#findcoupon_template').html(),
                    template = Handlebars.compile(source),
                    addParams = function () {
                        couponName = "";
                        item.zIndex = Sphome.ZINDEX;
                        Sphome.ZINDEX -= 1;

                        if (item.type === 10) {
                            couponName += "网站通用";
                        } else if (item.type === 20) {
                            if (item.servicerSize !== 1) {
                                couponName += "限定店铺";
                            } else if (item.servicerSize === 1) {
                                couponName += item.servicerList[0].nickname;
                                item.servicerId = item.servicerList[0].srid;
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
                            item.couponClass = "coupon-orange";
                        } else if (item.couponType === "直减") {
                            item.couponClass = "coupon-blue";
                        } else if (item.couponType === "一口价") {
                            item.couponClass = "coupon-green";
                        }

                        item.spList = $.toJSON(item.servicerList);
                    };

                for (i = 0, length = data.list.length; i < length; i += 1) {
                    item = data.list[i];
                    addParams();
                }

                html = template(data);
                list.empty().append(html);
            },

            queryCouponList: function () {
                var that = this,
                    list = $('#qf-couponList'),
                    request = new Ajax('/user/findOutCouponList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.list.length) {
                            that.writeCouponList(data.re);
                        } else {
                            var $noCoupon = $('<div class="no-coupon">暂时没有可以领取的卡券</div>')
                            list.empty().append($noCoupon);
                        }
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            updateSpList: function(couponType, tips, spList){
                var that = this,
                    data = {
                        couponType: couponType,
                        tips: tips,
                        spList: spList
                    },
                    container = $('#spListWrapper'),
                    html = "",
                    source = $('#coupon_sp_list').html(),
                    template = Handlebars.compile(source);
                html = template(data);
                container.empty().append(html);
            },

            // 商机表单

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
                            that.info.close();
                            dialog.show({
                                content: "提交成功"
                            });
                        } else {
                            that.info.close();
                            common.errorDialog(data);
                        }
                });
            },

            addPurpose: function () {
                var that = this,
                    messageVt = null,
                    form = document.forms.consultForm,
                    params = {
                        sourcetype: "30",   //10-首页“帮我找服务商”；20-服务页“留言咨询”；30-服务商列表页“推荐服务商”；40-服务商店铺；50-专家页；60-资讯页“专业财税顾问”；70-最近热搜页；80-最热资讯页；90-帮助中心
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
                            that.info.show({
                                content: that.$messageBox
                            });
                            $('#message-form input[type="text"]').placeholder();
                            messageVt = new FormVerified(document.getElementById('message-form'), function () {
                                that.editPurpose();
                            });
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

        var shop = new Shop();
    });
}(requirejs);