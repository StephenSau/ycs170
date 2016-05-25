/**
 * Created by Administrator on 2015/12/10 0010.
 */
(function(requirejs) {
    'use strict';
    requirejs(['jquery', 'common', 'info', 'dialog', 'superSlide', 'formVerified', 'handlebars', 'addressBox','dial','share','cookie','ajax','message'], function($, common, Info, Dialog, SuperSlide, FormVerified, Handlebars, addressBox,dial,share,cookie,Ajax,Message) {
        function ServiceRegion() {
            this.info = Info;
            this.dialog = Dialog;
            this.$newsRefresh = $(".question-wrap .news + .refresh");
            this.$normalRefresh = $(".question-wrap .qa  + .refresh");
            this.$providerRefresh = $(".provider-wrap .refresh");
            this.$newsPage = 2;
            this.$normalPage = 2;
            this.$providerPage = 2;
            this.$detailBtn = $(".pc-item .only > a");
            this.oTimer = null;
            this.$detailDialog = $(".coupon-dialog .coupon-popover");
            this.$connectDialog = $("#connect-dialog .connect-popover");
            this.$buyDialog = $("#next-dialog .next-popover");
            this.$addressBox = $("[data-spy = 'addressBox']").not("#top-showAddress");
            this.serviceid = $("[data-serviceid]").attr("data-serviceid");
            this.$choiceLi = $(".choice-wrap .list li");
            this.$choiceBox = [];
            this.$messageDialog = $("#message-dialog .message-popover");
            this.init();
        }
        ServiceRegion.prototype = {
            init: function() {
                var that = this;
                this.stepHeight = $("#top-bar").outerHeight(true) + $(".crumb-wrap").outerHeight(true) + $(".pc-wrap").outerHeight(true) + $(".choice-wrap").outerHeight(true) + $(".privilege-wrap").outerHeight(true) + $(".provider-wrap").outerHeight(true);
                this.commentHeight = this.stepHeight + $(".guarantee-wrap").outerHeight(true) + $(".step-wrap").outerHeight(true) + $(".question-wrap").outerHeight(true) / 2;

                $.each(this.$choiceLi,function(){
                    var $this = $(this);
                    if($this.is(".active")){
                        that.$choiceBox.push($this.attr("data-recordid"));
                    }
                });

                that.getCityCode();
                $('a[data-spy="share"]').share();
                this.registerHHelper();
                this.listener();
            },

            listener: function() {
                var that = this,
                    //comboTpl = Handlebars.compile($("#combo-dialog").html()),
                    choiceTpl = Handlebars.compile($("#choice-list-dialog").html()),
                    promotionTpl = $("#promotion-dialog .promotion");
                /*topbar address nav*/
                /*首页*/

                $('#top-bar li[data-spy="menu"]').on('mouseenter', function() {
                    $('#top-bar li[data-spy="menu"]').removeClass('active');
                    $(this).addClass('active');

                });

                $('#top-bar ul[data-spy="submenu"]').on('mouseleave', function() {
                    $(this).parent('li').removeClass('active');
                });

                $(document).on("mouseenter", '.set-pannel>li', function() {
                    var index = $(this).index();
                    $(this).siblings('li').removeClass('active');
                    $(this).addClass('active');
                });

                /*购买选择区域*/
                $("#pc-district,#top-showAddress").on("click", function() {
                        var $this = $(this);
                        addressBox.show(this, function() {
                            that.addressPost($this);
                        });
                    });


                    /*更多优惠信息*/
                $("#more-btn").on("click", function() {
                        that.info.show({
                            width: 632,
                            content: promotionTpl
                        });
                    })
                    /*区域详情*/
                $(document).on("click",".only > a", function() {
                    var index = $(".detail .coupon-dialog").index($(this).parent(".only").next());
                    that.info.show({
                        content: that.$detailDialog.eq(index)
                    })
                });

                /*关闭了解了解*/
                $(document).on("click", ".close-dialog", function() {
                    that.info.close();
                })


                /*套餐*/
                $("#combo-btn").on("click", function() {
                    that.comboTpl();
                });

                /*滚动出现的*/
                that.scrollShow();
                $(window).on("scroll", function() {
                    that.scrollShow();
                });

                /*选择套餐*/
                $(".choice-wrap .list-item li").on({
                        "click": function() {
                            that.choiceChecked(this);
                        },
                        "mouseenter": this.choiceEnter,
                        "mouseleave": this.choiceLeave
                    })
                    /*深入了解*/
                $('[data-spy="getmore"]').on("click", function(event) {
                    event.stopPropagation();
                    that.choiceTpl(this);

                });
                /*套餐区域选择*/
                $("#ui-info-content").on("click", '#tab-showAddress', function() {
                    addressBox.show(this);
                })
                $("#provider-showAddress").on("click", function() {
                    var $this = $(this);
                    addressBox.show(this, function() {
                        that.addressPost($this);
                    });
                })

                $(document).on("click", "#tab-showAddress", function() {
                    var $this = $(this),
                        $target = $("#tab-district");
                    addressBox.show(this, function() {
                        that.addressPost($this);
                    });
                })

                /*ajax submit form*/
                new FormVerified(document.getElementById("questionForm"), function() {

                    that.formPost();
                }, true);


                /*接口*/
                /*常见问题*/
                this.$normalRefresh.on("click", $.proxy(this.changeNormal, this));
                //弹出常见问题
                $(".question").on("click",".qa dd a",function(){
                    that.popNormal(this);
                })

                /*相关资讯*/
                this.$newsRefresh.on("click", $.proxy(this.changeInfo, this));
                /*服务商*/
                this.$providerRefresh.on("click", $.proxy(this.changeProvider, this));

                /*前往购买*/
                $(".buy-btn .next").on("click", $.proxy(this.buyDialog, this));
                $(document).on("click", ".next-popover .rechose", function() {

                    that.buyDialog();
                    that.info.close();
                });
                $(document).on("click", ".next-step", function() {
                    that.buyPost();
                });

                /*查看所有选择区域的服务商*/
                $(".provider-wrap .all").on("click",$.proxy(this.gotoService,this));

                /*改变tab服务*/
                $(document).on("click",".tab-list li",function(){
                    that.tabChecked(this);
                })

                /*改变tab服务*/
                $(document).on("click",".tab-head .prev",function(){
                    that.scrollTab(true);
                })

                /*改变tab服务*/
                $(document).on("click",".tab-head .next",function(){
                    that.scrollTab();
                })
            },
            /*前往购买弹框*/
            buyDialog: function() {
                var that = this,
                    addressLen = $("#pc-district").attr("data-value").split(",").length,
                    minAmount = $(".info .price").attr("data-minamount");


                if (addressLen == 2) {
                    addressBox.show($(".next-popover .rechose").get(0), function() {
                        var $this = $("#next-box")
                        that.addressPost($this);
                    });
                    $("#ui-addrBox").css({
                        left: "50%",
                        top: 250
                    });

                } else {

                    if(minAmount == -1){

                        that.info.show({
                            content: that.$buyDialog
                        });
                    }else{
                     that.buyPost();   
                    }
                }

            },
            buyPost : function(){
                
                var serviceid = this.serviceid,
                    minamount = $("[data-minamount]").attr("data-minamount"),
                    addressValue = $("#next-box").attr("data-value").split(","),
                    tagcode = $("[data-tagcode]").attr("data-tagcode"),
                    tagname = $("[data-tagcode]").html(),
                    province = addressValue[0],
                    city = addressValue[1],
                    district = addressValue[2],
                    list = $(".choice-wrap .list li"),
                    items = [],
                    param = "";
                    
                    $.each(list, function(){
                        var $this = $(this),
                            itemsJson = {};
                        if($this.is(".active")){
                            itemsJson.itemid = $this.attr("data-itemid");
                            itemsJson.itemname = $this.find(".name").text();
                            itemsJson.minprice = $this.find(".info").attr("data-minprice");
                            itemsJson.quantity = $this.find(".info").attr("data-quantity");
                            itemsJson.sigid = $this.find("[data-groupid]").attr("data-groupid");
                            items.push(itemsJson);
                        }
                    });


                    this.info.close();
                    window.open("/servicer/gotoChoosePage4Jsp.htm?" + "serviceid=" +serviceid + "&minamount=" +minamount+ "&province="+province+"&city="+city+"&district="+district+"&items="+JSON.stringify(items)+"&tagname="+tagname+"&tagcode="+tagcode,"_blank")
            },
            setCityCode: function (params) {
                var that = this,
                    values = $('#pc-district').attr('data-value').split(','),

                    request = new Ajax("/common/setCitycode.htm", params);

                    request.done(function (data) {
                        if (data.status === "200") {
                            that.setCookie({'provinceName': data.re.provinceCN});
                            that.setCookie({'cityName': data.re.cityCN});
                            that.setCookie({'provinceCode': data.re.province});
                            that.setCookie({'cityCode': data.re.city});
                            window.location.href = "?"+$.param(params);
                        }
                    });
            },
            getCityCode: function () {
                var that = this,
                    values = $('#pc-district').attr('data-value').split(','),
                    params = {
                        province : values[0],
                        city : values[1]
                    },
                     request = new Ajax("/common/setCitycode.htm",params);
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
                
                
            },
            setCookie: function (params) {
                var key = "";
                for (key in params) {
                    if (params.hasOwnProperty(key)) {
                        $.cookie(key, params[key], { expires: 7, path: '/'});
                    }
                }
            },
            /*combo*/
            comboTpl: function() {
                var that = this,
                    tpl = Handlebars.compile($("#combo-dialog").html()),
                    serviceid = $("[data-serviceid]").attr("data-serviceid"),
                    addressVal = $("#pc-district").attr("data-value").split(",");
                $.ajax({
                    type : "POST",
                    url: "/service/qryServiceGoodsSpecials.htm",
                    data: {
                        id: serviceid,
                        province : addressVal[0],
                        city : addressVal[1],
                        area : addressVal[2] || ""
                    },
                    dataType: "json"
                }).done(function(data) {

                    if (data.status == "200") {
                        $("#ui-info-content").data("index", 0);
                        that.info.show({
                            content: tpl(data.re)
                        });
                        $(".set-pannel-wrap").superSlide({
                            dialogCar: true,
                            callback: true,
                            showArrow: false,
                            iWidth: ".set-pannel-img",
                            showCount: 3
                        })
                    }else{
                        that.dialog.show({
                            content : data.errormsg
                        })
                    }
                })
            },
            /*深入更多*/
            choiceTpl: function(obj) {
                var that = this,
                    $this = $(obj),
                    tpl = Handlebars.compile($("#choice-list-dialog").html()),
                    servicegroupitemid = $this.attr("data-servicegroupitemid");

                that.choiceAjax(servicegroupitemid, true).done(function(data) {
                   
                       var  iLen = data.re.step.length;
                    $(".tab-list [data-servicegroupitemid='" + servicegroupitemid + "']").addClass('active');
                    /*超过5个就这样显示*/
                    if(iLen>4){

                         that.moveTab();
                    }

                })
            },

            moveTab : function(){
                 var list = $(".tab-list ul"),
                        scrollLi  ='',
                        iWidth = 0;
                        scrollLi = list.find(".active").prevAll();
                         $.each(scrollLi,function(){
                            iWidth += $(this).outerWidth(true);
                        })

                         list.stop().animate({
                            marginLeft : -iWidth
                         })
            },

            tabChecked : function(obj){
                    var that = this,
                        $this = $(obj),
                        inputBtn = $(".tab-head").has("input"),
                        servicegroupitemid = $this.data("servicegroupitemid");
                        if (!$this.is(".active")) {
                            $this.addClass('active').siblings().removeClass('active');
                            if(inputBtn.length){

                                that.moveTab();
                            }
                            this.choiceAjax(servicegroupitemid);
                        }
            },
            scrollTab : function(obj){
                    var that = this,
                    list = $(".tab-list ul"),
                    target = '';

                    if(obj){
                        target = list.find(".active").prev();
                    }else{
                        target = list.find(".active").next();
                    }

                    if(target.length){
                        that.tabChecked(target);
                    }
            },

            choiceAjax: function(servicegroupitemid, isDialog) {
                var that = this,
                    tpl = Handlebars.compile($("#choice-list-dialog").html()),
                    tabTpl = Handlebars.compile($("#choice-tab-tpl").html()),
                    value = $("#pc-district").attr("data-value"),
                    param = {
                        province: value.split(",")[0],
                        city: value.split(",")[1],
                        district: value.split(",")[2] || "",
                        servicegroupitemid: servicegroupitemid
                    };
                return $.ajax({
                    type: "POST",
                    url: "/service/thoroughUnderstanding.htm",
                    data: param,
                    dataType: "json"
                }).done(function(data) {
                    if (data.status == "200") {
                        if (isDialog) {
                            that.info.show({
                                content: tpl(data.re)
                            })
                        } else {
                            $(".tab-body").html(tabTpl(data.re));
                        }
                    }else{
                        that.dialog.show({
                                content: data.errormsg
                            })
                    }
                });
            },

            choiceChecked: function(obj) {
                var that = this,
                    $this = $(obj),
                    retId = [],
                    param = {},
                    url = "?",
                    addressValue = $("#pc-district").attr("data-value"),
                    type = $this.parent().attr("data-type"),
                    serviceid = this.serviceid,
                    choiceLi = $(".choice-wrap .list li"),
                    iLen = $this.parent().find("li").filter(".active").length;

                /*取消请求*/
                clearTimeout(that.oTimer);

                if(type == 1){
                    if($this.is(".active")){
                        return;
                    }
                    $this.addClass('active').siblings("li").removeClass('active');
                }else{

                    if($this.is(".active") && iLen >1){
                        $this.removeClass("active");
                    }else if($this.is(".active") && iLen ==1){
                        return;
                    }else if(!$this.is(".active")){
                        $this.addClass('active');
                    }
                }

                $.each(choiceLi,function(){
                    var $this = $(this);
                    if($this.is(".active")){
                        retId.push($this.attr("data-recordid"));
                    }
                })

                param = {
                    id: serviceid,
                    province: addressValue.split(",")[0],
                    city: addressValue.split(",")[1],
                    area: addressValue.split(",")[2] || "",
                    siids: retId.join("-")
                };
                
                url += $.param(param);
                that.oTimer = setTimeout(function(){

                    window.location.href = url;
                },1000);


            },

            choiceEnter: function() {
                $(this).children("a").stop().animate({
                    bottom: 0
                });
            },
            choiceLeave: function() {
                $(this).children("a").stop().animate({
                    bottom: -35
                });
            },

            scrollShow: function() {
                if ($(window).scrollTop() >= this.stepHeight) {
                    $(".step-wrap .carousel-wrap").addClass("active");
                }
                if ($(window).scrollTop() >= this.commentHeight) {
                    $(".comment-wrap ul").addClass("active");
                }
            },
            /*post ajax data*/
            formPost: function() {
                var that = this,
                    addressValue = $("#pc-district").attr("data-value");
                /*send form data*/
                var params = {
                    comments: $.trim(question.content.value),
                    tel: $.trim(question.phone.value),
                    title: $.trim(question.username.value),
                    province: addressValue.split(",")[0],
                    city: addressValue.split(",")[1],
                    district: addressValue.split(",")[2] || "",
                    sdcat1: "-1",
                    sourcetype: 20
                }


                this.dialog.show({
                    content: "<div class='info-loading'>处理中，请稍后</div>"
                });

                $.post('/servicer/addPurpose.htm', params, function(data) {
                    that.dialog.close();
                    if (data.status === "200") {
                        var id = data.re.id,
                            message = new Message();

                            message.show(id,function(){
                                    /*回调清空数据*/
                                    question.content.value ="";
                                    question.phone.value ="";
                                    question.username.value="";

                            });
                       
                    } else {
                        that.dialog.show({
                            content: data.errormsg
                        });
                    };
                });
            },
            addressPost: function(obj) {
                var that = this,
                    value = obj.attr("data-value"),
                    serviceid = this.serviceid,
                    param = {
                        id : serviceid,
                        province: value.split(",")[0],
                        city: value.split(",")[1],
                        area: value.split(",")[2] || "",
                        siids : that.$choiceBox.join("-")
                    };
                $.ajax({
                    type : "POST",
                    url: "/service/qryServiceDetailByCode.htm",
                    data: param
                }).done(function(data) {
                    if (data.status == 200) {
                        that.setCityCode(param);
                        
                    }else{
                        that.dialog.show({
                            content : data.errormsg
                        })
                    }
                })
            },
            /*常见问题*/
            changeNormal: function() {
                var that = this,
                    template = Handlebars.compile($("#normal-tpl").html()),
                    target = $(".question-wrap .qa"),
                    pagenumber = that.$normalPage++,
                    articleList = '',
                    totalPage = 0,
                    id = $("[data-serviceid]").attr("data-serviceid"),
                    param = {
                        id: id,
                        url: "/service/qryCommonProblems.htm",
                        pagenumber: pagenumber
                    };
                this.refreshTpl(param).done(function(data) {
                    articleList = data.re.commonproblems;
                    totalPage = data.re.commonproblems.totalPage;
                    target.html(template(articleList));
                    if (pagenumber >= totalPage) {
                        that.$normalPage = 1;
                    }
                });

            },

            popNormal : function(obj){
                var $this = $(obj),
                    title = $this.parent("dd").prev("dt").text(),
                    normal = $this.parent("dd").find("i").text().split(/\d、/g),
                    html = '',
                    inter = 0;

                    if(normal.length ===1){
                        html = "<p>"+normal.toString()+"</p>"
                    }else{

                        $.each(normal,function(index,value){
                            if(value !== "" ){
                                inter++;
                                html += "<p>"+inter+"、"+value+"</p>";
                            }
                        });
                    }


                this.dialog.show({
                    content : html,
                    title : title
                })
            },
            /*相关资讯*/
            changeInfo: function() {
                var that = this,
                    template = Handlebars.compile($("#info-tpl").html()),
                    target = $(".question-wrap .news"),
                    pagenumber = that.$newsPage++,
                    articleList = '',
                    totalPage = 0,
                    id = $("[data-serviceid]").attr("data-serviceid"),
                    param = {
                        url: "/service/qryRelatedArticles.htm",
                        id: id,
                        pagenumber: pagenumber
                    };
                this.refreshTpl(param).done(function(data) {
                    totalPage = data.re.releatearticles.totalPage,
                        articleList = data.re.releatearticles;
                    target.html(template(articleList));

                    if (pagenumber >= totalPage) {
                        that.$newsPage = 1;
                    }
                });
            },
            registerHHelper: function() {
                /*Handlebars.registerHelper("compare", function(v1, v2, options) {
                    if (v1 > v2) {
                        //满足添加继续执行
                        var ret = this.description.substring(0, 100) + '..<a href="#" target="_blank">查看全文 <span class="arrow">&gt;&gt;</span></a>';
                        return ret;

                    } else {
                        //不满足条件执行{{else}}部分
                        return this.description;
                    }
                });*/

                Handlebars.registerHelper("toText", function(value, options) {
                    switch (value) {
                        case '0':
                            return "赠券";
                        case '1':
                            return "折扣";
                        case '2':
                            return "直减";
                        case '3':
                            return "一口价";

                    }
                });

                Handlebars.registerHelper("toNumber", function(value, options) {
                    if (value != 1) {
                        return options.fn(this);
                    }
                });


                Handlebars.registerHelper("toStep", function(value, options) {
                    // console.log(this)

                    var step = this.step,
                        html = [],
                        html1 = [],
                        html2 = [],
                        tr1Html = [],
                        tr2Html = [],
                        len = value,
                        trHtml = [];

                    if(len>0 && len <=4){
                        html.push("<tr>");
                        $.each(step,function(key,value){
                             if(key == (len-1)){
                                        html.push('<td class="business"><i class="icon ok"></i>'+value['name']+'</td>');
                                }else{
                                        
                                            html.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-r"><i class="arrow-icon"></i></td>');
                                }
                        });
                        html.push("</tr>");
                        return html.join("");
                    }else if(len > 4 && len <9){
                        /*超过4个情况*/  

                        html.push("<tr>");
                        $.each(step,function(key,value){
                            if(key <=3){
                              if(key == 3){
                                        html.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td>');
                                }else{
                                        
                                        html.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-r"><i class="arrow-icon"></i></td>');
                                }  
                            }
                             
                        });
                        html.push("</tr>");
                        /*超过8个情况 */
                        tr1Html.push('<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td class="arrow-d"><i class="arrow-icon"></i></td></tr>');
                        html1.push("<tr>");
                        $.each(step,function(key,value){
                            if(key >3 && key < 8){
                                if(key == (len-1)){
                                        if(key == 4){
                                            html1.push('<td class="business"><i class="icon ok"></i>'+value['name']+'</td>');
                                        }else{

                                            html1.push('<td class="business"><i class="icon ok"></i>'+value['name']+'</td><td class="arrow-l"><i class="arrow-icon"></i></td>');
                                        }
                                }else{
                                        if(key == 4){

                                            html1.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td>');
                                        }else{

                                            html1.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-l"><i class="arrow-icon"></i></td>');
                                        }
                                }
                            }
                        });
                        for(var i = (value+1);i<(17-value);i++){
                            html1.push('<td>&nbsp;</td>');
                        }
                        html1.reverse();
                        html1.push("</tr>");
                        return html.concat(tr1Html).concat(html1).join("");
                    }else if(len >=9 ){
                        /*超过4个情况*/  

                        html.push("<tr>");
                        $.each(step,function(key,value){
                            if(key <=3){
                              if(key == 3){
                                        html.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td>');
                                }else{
                                        
                                        html.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-r"><i class="arrow-icon"></i></td>');
                                }  
                            }
                             
                        });
                        html.push("</tr>");
                        /*超过8个情况 */
                        tr1Html.push('<tr><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td class="arrow-d"><i class="arrow-icon"></i></td></tr>');
                        html1.push("<tr>");
                        $.each(step,function(key,value){
                            if(key >3 && key < 8){
                                if(key == 4){
                                    html1.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td>');
                                }else{

                                    html1.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-l"><i class="arrow-icon"></i></td>');
                                }
                            }
                        });
                        html1.reverse();
                        html1.push("</tr>");
                        tr2Html.push('<tr><td class="arrow-d"><i class="arrow-icon"></i></td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>');
                        html2.push("<tr>");
                        $.each(step,function(key,value){
                            if(key == (len-1)){
                                if(key == 8){

                                    html2.push('<td class="business"><i class="icon ok"></i>'+value['name']+'</td>');
                                }else if(key >8 ){
                                    html2.push('<td class="arrow-r"><i class="arrow-icon"></i></td><td class="business"><i class="icon ok"></i>'+value['name']+'</td>');
                                }
                            }else{
                                if(key == 8){

                                        html2.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td>');
                                    }else if(key > 8){

                                        html2.push('<td class="business"><i class="icon">'+value['sort']+'</i>'+value['name']+'</td><td class="arrow-l"><i class="arrow-icon"></i></td>');
                                    }
                            }
                        });
                        for(var i = (value+1);i<(24-value);i++){
                            html2.push('<td>&nbsp;</td>');
                        }
                        html2.push("</tr>");
                    return html.concat(tr1Html).concat(html1).concat(tr2Html).concat(html2).join("");
                    }
                });
                Handlebars.registerHelper("toActived", function(value, options) {
                    if (value == 0) {
                        return "active";

                    }
                });
                Handlebars.registerHelper("toLast", function(value, parent, options) {
                    if (value == (parent.length - 1)) {
                        return "class=last";

                    }
                });

                Handlebars.registerHelper("toShowbtn", function(value, options) {
                    if (value > 4) {
                        return options.fn();

                    }
                });
            },
            changeProvider: function() {
                var that = this,
                    tpl = Handlebars.compile($("#provider-tpl").html()),
                    addressValue = $("#provider-showAddress").attr("data-value"),
                    dataId = $(".choice-wrap li"),
                    itemids = [];

                $.each(dataId, function() {
                    if ($(this).is(".active")) {
                        if(!itemids[$(this).attr("data-itemid")]){
                            itemids.push($(this).attr("data-itemid"));
                        }
                    }
                })

                $.ajax({
                    type : "POST",
                    url: "/servicer/getServicerList4Servicepage.htm",
                    data: {
                        itemids: itemids.join(","),
                        province: addressValue.split(",")[0],
                        city: addressValue.split(",")[1],
                        district: addressValue.split(",")[2] || "",
                        pageNumber: that.$providerPage
                    },
                    dataType: "json"
                }).done(function(data) {
                    var totalPage = data.re.totalPage,
                        servicerList = data.re.servicerList,
                        actRow = data.re.actRow;
                    if (data.status == 200) {

                        $(".provider-wrap ul").html(tpl(servicerList));
                        $(".provider-wrap .actRow").html(actRow);
                        dial.refresh();
                        if (that.$providerPage < totalPage) {
                            that.$providerPage++;
                        } else {
                            that.$providerPage =1;
                        }
                    }else{
                        that.dialog.show({
                            content : data.errormsg
                        })
                    }
                })
            },
            refreshTpl: function(obj) {
                return $.ajax({
                    type: "POST",
                    url: obj.url,
                    data: {
                        id: obj.id,
                        pagenumber: obj.pagenumber
                    },
                    dataType: "json"
                }).fail(function() {});
            }
        };

        var serviceRegion = new ServiceRegion();
    });

}(window.requirejs));
