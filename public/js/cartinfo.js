/**
 * Created by Administrator on 2015/12/26 0026.
 */
! function(requirejs) {
    'use strict';
    requirejs(['jquery','ajax', 'common', 'handlebars','addressBox','dial','paginate','dialog'], function($,Ajax,common, Handlebars,addressBox,dial,Paginate,dialog) {
            var Cartinfo = function() {
                this.$item = $(".step-1 .service li");
                this.$cartlist = $(".cartlist");
                this.$servicer = this.$cartlist.find(".servicer strong");
                this.$message = this.$cartlist.find(".message");
                this.$amount = this.$cartlist.find(".amount em");
                
                this.spBtn = $(".sphome-list").find(".btn-shop");
                this.sortfield = $(".category [data-sortfield]");
                this.threelicense = $("#three-terms");
                this.priceList = $("#price-list");
                this.keywords = $("[name='keywords']");
                this.seach = $(".search-bar .search-btn");
                this.buyBtn = $(".buy.btn-buy");
                this.otherBtn = $(".cartlist .other");
                this.cartTotalRe =  $(".cartlist dt .price i");
                this.messageBtn = $(".message a");
                this.init();
            }

            Cartinfo.prototype = {
                    init: function() {
                        this.registerHHelper();
                        this.initForm();
                        this.listener();

                    },
                    listener: function() {
                        var that = this;
                        /*topbar address nav*/
         
                        this.$item.on("click", function() {
                            that.serviceChecked(this);
                        })
                        this.$cartlist.on("click", ".delete i", function() {
                            that.deleteItem(this);
                        })
                        $(document).on("click", "#price-list",function(){
                        	that.priceToggle(this);
                        });

                        /*选择服务商*/

                        $(document).on("click", ".sphome-list .btn-shop", function() {
                            that.spSelected(this);
                        });
                        /*筛选*/
                        this.sortfield.on("click", function() {
                            that.sortRet(this);
                        })

                        /*三项合一*/
                        this.threelicense.on("click", function() {
                            that.threelicenseRet(this)
                        })

                        /*搜索服务商*/
                        this.seach.on("click", function(event) {
                            event.preventDefault();
                            that.searchRet();
                        });

                        /*购物车结算*/
                        this.buyBtn.on("click",function(){
                            that.goBuy(this);
                        })

                        // 还要购买其他
                        this.otherBtn.on("click",function(){
                            that.goOther(this);
                        });

                        //affix shopbar

                        $(window).on({
                            "scroll":function(){

                                that.scrollShopCart();
                            },
                            "resize":function(){
                                that.shopCartMaxHeight();
                            }
                        });
                        //init affix
                        that.shopCartMaxHeight();
                        that.scrollShopCart();


                        $(".shop p").on({
                            "click":function(){
                                that.buyMouseenter();
                            }
                        });

                        //运动完
                        this.messageBtn.on("webkitanimationend animationend",function(){
                            that.animateEndFn(this);
                        });

                        this.messageBtn.on("click",function(){
                            that.scrollSp();
                        })


                    },
                    scrollSp: function(){
                        var oStep = $(".step-2"),
                            offsetTop = oStep[0].offsetTop,
                            headFloat= $(".head-float");

                            if(headFloat.is(":visible")){
                                $(window).scrollTop(offsetTop+119);
                            }else{

                                $(window).scrollTop(offsetTop+192)
                            }
                    },
                    buyMouseenter : function(){
                        this.messageBtn.addClass("active");
                    },

                    animateEndFn : function(obj){
                        obj.className = "";
                    },
                    
                    scrollShopCart : function(){
                        var oCartlist = $(".cartlist"),
                            offsetTop = $(".cartinfo-wrap")[0].offsetTop,
                            scrollTop = $(window).scrollTop();

                            if(scrollTop >= offsetTop && scrollTop < 700){
                                oCartlist.css({"position":"fixed","top":"0","left":"50%","marginLeft":"325px"})
                            }else if(scrollTop >= 700){
                                oCartlist.css({
                                    "position" :"fixed",
                                    "left":"50%",
                                    "marginLeft":"325px",
                                    "top":"75px"
                                });
                            }else{
                                oCartlist.css({
                                    "position":"static",
                                    "marginLeft" : "0"
                                });
                            }

                    },
                    shopCartMaxHeight : function(){
                        var oCartlist = $(".cartlist"),
                            scrollTop = $(window).scrollTop(),
                            winHeight = $(window).height();
                            if(scrollTop < 700){
                                oCartlist.css({
                                    "max-height":winHeight-192
                                });
                            }else{
                                oCartlist.css({
                                    "max-height":winHeight-270
                                });
                            }

                            
                    },
                    initForm : function(){
                        this.threelicense.removeProp('checked');
                        // this.priceList.removeProp('checked');
                        this.keywords.val('');

                    },
                    sortRet: function(obj) {
                        var $this = $(obj),
                            field = $this.attr("data-sortfield"),
                            condition = $this.attr("data-condition"),
                            parent = $this.parent();

                        parent.addClass('active').siblings().removeClass('active');

                        this.filter();
                        if (condition == "desc") {
                            $this.attr("data-condition", "asc");
                        } else {
                            $this.attr("data-condition", "desc");
                        }
                    },

                    threelicenseRet: function(obj) {

                        this.filter();

                    },
                    searchRet: function() {

                        this.filter();

                    },

                    serviceChecked: function(obj) {
                        var that = this,
                            $this = $(obj),
                            $index = $this.attr("data-index"),
                            $groupid = $this.attr("data-groupid"),
                            $groupname = $this.attr("data-groupname"),
                            $itemid = $this.attr("data-itemid"),
                            $itemname = $this.attr("data-itemname"),
                            $price = $this.attr("data-price"),
                            $srsid = $this.attr("data-srsid"),
                            $quantity = $this.attr("data-quantity"),
                            $dataStr = " data-groupid='" + $groupid + "' data-groupname='" + $groupname + "' data-itemid='" + $itemid + "' data-itemname='" + $itemname + "' data-price='" + $price + "' data-srsid='" + $srsid + "' data-quantity='" + $quantity + "' data-index='" + $index + "'",
                            type = $this.parents("li").attr("data-type"),
                            oDl = this.$cartlist.find("dl"),
                            oDd = this.$cartlist.find("dd"),
                            item = $this.find(".item").html(),
                            price = $this.find(".price").html(),
                            html = [];
                        html.push('<dd class="clearfix"' + $dataStr + '>');
                        html.push('<div class="ok">');
                        html.push('<em></em>');
                        html.push('</div>');
                        html.push('<div class="item">');
                        html.push('<p>');
                        html.push(item);
                        html.push('</p>');
                        html.push('<p class="price">');
                        html.push('<i>');
                        html.push(price);
                        html.push('</i>');
                        html.push('</p>');
                        html.push('</div>');
                        html.push('<div class="delete">');
                        html.push('<i></i>');
                        html.push('</div>');
                        html.push('</dd>');

                        if (type == 1) {
                            if ($this.is(".active")) {
                                $this.removeClass("active");
                                oDd.filter("[data-index='" + $index + "']").remove();
                            } else {
                                $this.addClass('active').siblings('li').removeClass('active');

                                oDd.filter("[data-index^=" + $index.split("-")[0] + "]").remove();

                                oDl.append(html.join(''));
                            }
                        } else {

                            $this.toggleClass("active");
                            if ($this.is(".active")) {
                                oDl.append(html.join(''));
                            } else {
                                oDd.filter("[data-index='" + $index + "']").remove();
                            }
                        }
                        that.filter();
                    },

                    deleteItem: function(obj) {
                        var $this = $(obj),
                            index = $this.parents("dd").attr("data-index"),
                            cancelItem = this.$item.filter("[data-index='" + index + "']");

                        $this.parents("dd").remove();

                        cancelItem.removeClass('active');

                        this.filter();
                    },


                    priceToggle: function(obj) {
                        var pricelist = $(".sphome-list").find(".price-list"),
                        	$this = $(obj);

                        	if($this.is(":checked")){
                        		 pricelist.stop().slideDown();
                        	}else{
                        		pricelist.stop().slideUp();
                        	}
                           
                    },
                    spSelected: function(obj) {
                        var $this = $(obj),
                            $siblings = $this.parents("li").siblings("li").find(".btn-shop"),
                            price = $this.parents("li").attr("data-amount"),
                            srid = $this.parents("li").attr("data-srid"),
                            name = $this.parents("li").attr("data-name"),
                            cartItem = $(".cartlist dt .require,.cartlist dd"),
                            cartItemRe =  $(".cartlist dt .require"),
                            priceJson = this.orginCart(),
                            priceList = $this.parents("li").find(".price-list p"),
                            totalRequire = 0;


                    if ($this.is(".checked")) {
                        $this.removeClass("checked").html("选择他为我服务");

                        /*返回添加元*/
                         $.each(priceJson,function(key,value){
                           var $this = $(this),
                                everyItem = cartItem.filter("[data-itemid="+key+"]");
                                
                                everyItem.attr({
                                    "data-srsid":"",
                                    "data-price" : ""
                                }).removeClass("active");
                                if(everyItem.is("p")){
                                    everyItem.parents("dt").find(".price i").html(everyItem.attr("data-orginprice")+"元起");

                                }else{
                                    everyItem.find(".price i").removeClass("active").text(value+"元起");
                                }
                        });
                        this.cartTotalRe.parent().removeClass("active");
                        this.cancelCart();

                    } else {

                        $this.addClass("checked").html("<em>&radic;</em> 已选择");
                        $siblings.removeClass("checked").html("选择他为我服务");
                        this.buyBtn.next("span").hide();
                        this.buyBtn.addClass("active").prop("disabled",false).attr("data-srid",srid||"");
                        this.otherBtn.addClass("active").prop("disabled",false);
                        
                        this.$message.hide();
                        this.$servicer.html(name)
                            .parent().show();
                        this.$amount.html("&yen;<i>"+price+"</i>");
                        
                        /*非必选的单价*/
                        $.each(priceList,function(){
                           var $this = $(this),
                                everyItem = cartItem.filter("[data-itemid="+$this.attr("data-itemid")+"]");
                                everyItem.find(".price i").text($this.attr("data-price"));
                                everyItem.attr({
                                    "data-srsid":$this.attr("data-srsid"),
                                    "data-price" : $this.attr("data-price")
                                }).addClass("active");
                                if(!everyItem.is("p")){
                                    everyItem.find(".price i").text($this.attr("data-price")+"元");
                                }
                        });

                        /*必选的总价格*/
                        $.each(cartItemRe,function(){
                                var $this = $(this);
                                totalRequire +=parseFloat($this.attr("data-price"));
                        });

                        this.cartTotalRe.text(totalRequire+"元").parent().addClass("active");

                    }

                },
                /*取消购买*/
                cancelCart : function(){
                    this.$message.show();
                    this.$servicer.html("")
                        .parent().hide();
                    this.$amount.html("-");
                    this.buyBtn.removeClass("active").prop("disabled",true).removeAttr("data-srid");
                    this.buyBtn.next("span").show();
                     this.otherBtn.removeClass("active").prop("disabled",true);
                },

                shopCart : function(obj,url){
                    var $this = $(obj),
                        cartItem = $(".cartlist dt .require,.cartlist dd"),
                        addressValue = $("[data-address]").attr("data-address").split(","),
                        serviceid = $("[data-serviceid]").attr("data-serviceid"),
                        categorycode = $("[data-tagcode]").attr("data-tagcode"),
                        tempGroup = {},
                        list = [],
                        srid = $(".shop [data-srid]").attr("data-srid"),
                        param = {};

                    $.each(cartItem, function() {

                        var $this = $(this),
                            groupid = $this.attr("data-groupid"),
                            itemid = $this.attr("data-itemid"),
                            srsid = $this.attr("data-srsid"),
                            quantity = $this.attr("data-quantity"),
                            itemname = $this.attr("data-itemname"),
                            price = parseFloat($this.attr("data-price"))/parseFloat($this.attr("data-quantity"));

                        if (!tempGroup[groupid]) {
                            tempGroup[groupid] = {};
                            tempGroup[groupid].items = [];
                        }
                        tempGroup[groupid].groupid = groupid;

                        tempGroup[groupid].items.push({

                            itemid: itemid,
                            srsid: srsid,
                            quantity: quantity,
                            itemname: itemname,
                            price: price
                        });

                    })

                    list = $.map(tempGroup, function(value,key ) {
                        return value;
                    });

                    param = {
                        srid: srid,
                        province: addressValue[0],
                        city: addressValue[1],
                        district: addressValue[2] || '',
                        categorycode: categorycode,
                        serviceid: serviceid,
                        list : JSON.stringify(list)
                        
                    };


                    $.ajax({
                        type : "POST",
                        url : "/servicer/gotoOrdercart.htm",
                        data : param,
                        dataType : "json",


                    }).done(function(data){
                        if(data.status == 200){
                            window.location.href=url;
                        }else{
                            dialog.show({
                                content : data.errormsg
                            })
                        }
                    })
                },

                goBuy : function(obj){
                    var url = "/app/cart.html";
                    this.shopCart(obj,url);
                },

                goOther : function(obj){
                    var $this = $(obj),
                    url = $this.attr("data-href");
                    this.shopCart(obj,url);
                },

                filter: function () {
                    var that = this,
                        $this = $(this),
                        that = this,
                        param = {},
                        cartItem = $(".cartlist dt .require,.cartlist dd"),
                        addressValue = $("[data-address]").attr("data-address").split(","),
                        checkCat = $(".category > .active em"),   
                        
                        tagcode = $("[data-tagcode]").attr("data-tagcode"),
                        serviceid = $("[data-serviceid]").attr('data-serviceid'),
                        field = checkCat.attr("data-sortfield"),
                        condition = checkCat.attr("data-condition"),
                        threelicenseVal = $("#three-terms").is(":checked") ? 0 : 1, threelicenseVal = $("#three-terms").is(":checked") ? 0 : 1,
                        servicername = $.trim($(".keywords").val()),
                        itemArr = [];

                        $.each(cartItem, function() {
                            var $this = $(this),
                                itemJson = {};
                                itemJson.itemid = $this.attr("data-itemid");
                                itemJson.quantity = $this.attr("data-quantity");
                                itemArr.push(itemJson);
                        });

                    this.filterListPaginate = new Paginate({
                        position: "#pbl_pager",
                        anchorPoint: "list-bar",
                        amount: 18,
                        currentPage: 1,
                        pages: 18,
                        data: {
                            pageSize: 18,
                            pageNumber: 1,
                            iscomefromchoose: 0,
                            tagcode: tagcode,
                            items: JSON.stringify(itemArr),
                            threelicense: threelicenseVal,
                            serviceid: serviceid,
                            servicername: servicername,
                            province: addressValue[0],
                            city: addressValue[1],
                            district: addressValue[2] || '',
                            sortfield: field,
                            ascOrDesc: condition,
                        },
                        invoke: function () {
                            that.qryList.apply(that, arguments);
                        }
                    });
                },

                qryList: function (paramsObj) {
                    var that = this,
                        key = "",
                        params = {},
                        request = null;
                    for (key in paramsObj) {
                        params[key] = paramsObj[key];
                    }
                    delete params.func;
                    var request = new Ajax('/servicer/getServicerListById.htm', params);
                    request.done(function (data) {
                        if (data.status === "200") {
                            that.writeTable(data);
                            paramsObj.func(that.filterListPaginate, params.pageSize, params.pageNumber, data.re.totalPage);
                        } else {
                            common.errorDialog(data);
                        }
                    });
                },


                writeTable : function(data){
                    var that =this,
                        list = $(".sphome-list .list"),
                        cartItem = $(".cartlist dt .require,.cartlist dd"),
                        tpl = Handlebars.compile($("#list-tpl").html());
                        list.html(tpl(data.re));
                            /*重新初始化*/
                            dial.refresh();
                            if($("#price-list").is(":checked")){
                            	$(".sphome-list").find(".price-list").show();
                            }else{
                            	$(".sphome-list").find(".price-list").hide();
                            }
                             
                            var priceJson = that.orginCart();
                             $.each(priceJson,function(key,value){
                               var $this = $(this),
                                    everyItem = cartItem.filter("[data-itemid="+key+"]");
                                    everyItem.attr({
                                        "data-srsid":"",
                                        "data-price" : ""
                                    });
                                    if(everyItem.is("p")){
                                    everyItem.parents("dt").find(".price i").html(everyItem.attr("data-orginprice")=='-1'?'暂无定价':(everyItem.attr("data-orginprice")+"元起"));

                                    }else{
                                        everyItem.find(".price i").text($this.attr("data-price"));
                                    }
                                })
                            that.cancelCart();
                },

                orginCart : function(){
                    var checkedItem = $(".step-1 li.active,.cartlist dt .require"),
                        priceJson = {};

                    $.each(checkedItem,function(){
                        var $this = $(this),
                            itemid = $this.attr("data-itemid"),
                            price = parseInt($this.attr("data-orginprice"));
                            priceJson[itemid] = price;
                    })

                    return priceJson;
                },
                registerHHelper: function() {
                    Handlebars.registerHelper("toFloat", function(value, options) {
                        if(parseInt(value) == value){
                            return parseInt(value)+".0";
                        }else{
                            return value;
                        }
                    });

                    Handlebars.registerHelper("toBussiness", function(value, options) {
                        switch (value) {
                            case "10":
                                return "工商";
                                break;
                            case "20":
                                return "财务会计";
                                break;
                            case "30":
                                return "审计";
                                break;
                            case "40":
                                return "税务";
                                break;
                            case "50":
                                return "法律";
                                break;
                            case "60":
                                return "资产评估";
                                break;
                            case "70":
                                return "许可证";
                                break;
                            case "80":
                                return "商标专利";
                                break;
                            case "90":
                                return "人力资源";
                                break;
                        }
                    });

                    Handlebars.registerHelper("toAdmin", function(value, options) {
                        if (value != "admin") {
                            return options.fn(this);
                        }
                    })
                }
        };

        new Cartinfo;
    })
}(requirejs)
