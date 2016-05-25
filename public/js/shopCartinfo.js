/**
 * Created by Administrator on 2015/12/26 0026.
 */
! function(requirejs) {
    'use strict';
    requirejs(['jquery','ajax', 'common', 'handlebars','addressBox','dial','paginate',"dialog"], function($,Ajax,common, Handlebars,addressBox,dial,Paginate,dialog) {
            var Cartinfo = function() {
                this.$requireItem = $(".step-1 .service li");
                this.$noRequireItem = $(".step-2 .service li");
                this.$cartlist = $(".cartlist");
                this.$totalAmount = this.$cartlist.find(".amount em");
                this.$requireAmout = this.$cartlist.find("dt .price i");
                this.buyBtn = $(".btn-buy");
                this.otherBtn = $(".cartlist .other");
                this.cartTotalRe =  $(".cartlist dt .price i");
                this.init();
            }

            Cartinfo.prototype = {
                    init: function() {
                        this.listener();
                    },
                    listener: function() {
                        var that = this;
                        /*topbar address nav*/
                        this.$requireItem.on("click", function() {
                            that.requireService(this);
                        })
                        this.$noRequireItem.on("click", function() {
                            that.noRquireService(this);
                        })
                        this.$cartlist.on("click", ".delete i", function() {
                            that.deleteItem(this);
                        })
                        /*购物车结算*/
                        this.buyBtn.on("click",function(){
                            that.goBuy(this);
                        });

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

                        // init affix
                        that.shopCartMaxHeight();
                        that.scrollShopCart();
                    },
                    /*shopcart module*/
                    scrollShopCart : function(){
                        var oCartlist = $(".cartlist"),
                            offsetTop = $(".cartinfo-wrap")[0].offsetTop,
                            scrollTop = $(window).scrollTop();

                            if(scrollTop >= offsetTop && scrollTop < 700){
                                oCartlist.css({"position":"fixed","top":"0","left":"50%","marginLeft":"325px"})
                            }else if(scrollTop >= 700){
                                oCartlist.css({
                                    "position" :"fixed",
                                    "top":"0",
                                    "left":"50%",
                                    "marginLeft":"325px",
                                    "top":"75px"
                                })
                            }else{
                                oCartlist.css({
                                    "position":"static",
                                    "marginLeft" : "0"
                                })
                            }

                    },
                    shopCartMaxHeight : function(){
                        var oCartlist = $(".cartlist"),
                            scrollTop = $(window).scrollTop(),
                            winHeight = $(window).height();
                            if(scrollTop < 700){
                                oCartlist.css({
                                    "max-height":winHeight-95
                                });
                            }else{
                                oCartlist.css({
                                    "max-height":winHeight-168
                                });
                            }


                            
                    },
                    requireService: function(obj) {
                        var that = this,
                            $this = $(obj),
                            $index = $this.attr("data-index"),
                            type = $this.parents("li").attr("data-type"),
                            oDl = this.$cartlist.find("dt .requireItem"),
                            oDd = oDl.find("p"),
                            item = $this.find(".item").html(),
                            price = $this.find(".price").html(),
                            html = [];
                        html.push('<p class="require title"' + this.createItem(obj) + '>');
                        html.push(item);
                        html.push("</p>");


                        if (type == 1) {
                            if ($this.is(".active")) {
                                return;
                            } else {
                                $this.addClass('active').siblings('li').removeClass('active');

                                oDd.filter("[data-index^=" + $index.split("-")[0] + "]").remove();

                                oDl.append(html.join(''));
                            }
                        } else {

                            if ($this.is(".active")) {
                                if($this.parent().find(".active").length == 1){
                                    return;
                                }
                                $this.removeClass('active')
                                oDd.filter("[data-index='" + $index + "']").remove();
                            } else {
                                $this.addClass('active');
                                
                                oDl.append(html.join(''));
                            }
                        }

                        this.$requireAmout.html(this.requireAmount());
                        this.$totalAmount.html(this.totalAmount());
                    },
                    noRquireService: function(obj) {
                        var that = this,
                            $this = $(obj),
                            $index = $this.attr("data-index"),
                            type = $this.parents("li").attr("data-type"),
                            oDl = this.$cartlist.find("dl"),
                            oDd = this.$cartlist.find("dd"),
                            item = $this.find(".item").html(),
                            price = $this.find(".price").html(),
                            html = [];
                        html.push('<dd class="clearfix"' + this.createItem(obj) + '>');
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

                        this.$totalAmount.html(this.totalAmount());
                    },

                    createItem : function(obj){
                       var  $this = $(obj),
                            $groupid = $this.attr("data-groupid"),
                            $groupname = $this.attr("data-groupname"),
                            $itemid = $this.attr("data-itemid"),
                            $itemname = $this.attr("data-itemname"),
                            $price = $this.attr("data-price"),
                            $srsid = $this.attr("data-srsid"),
                            $quantity = $this.attr("data-quantity"),
                            $index = $this.attr("data-index"),
                            $dataStr = " data-groupid='" + $groupid + "' data-groupname='" + $groupname + "' data-itemid='" + $itemid + "' data-itemname='" + $itemname + "' data-price='" + $price + "' data-srsid='" + $srsid + "' data-quantity='" + $quantity + "' data-index='" + $index + "'";
                            return $dataStr;
                    },

                    deleteItem: function(obj) {
                        var $this = $(obj),
                            index = $this.parents("dd").attr("data-index"),
                            cancelItem = this.$noRequireItem.filter("[data-index='" + index + "']");

                        $this.parents("dd").remove();

                        cancelItem.removeClass('active');

                    },

                    totalAmount : function(){
                        var cartItem = $(".cartlist .requireItem p,.cartlist dd"),
                            totalAmount = 0;
                            $.each(cartItem,function(){
                                var $this = $(this);
                                totalAmount += parseFloat($this.attr("data-price"));
                            });

                            return totalAmount;

                    },
                    requireAmount : function(){
                        var cartItem = $(".cartlist .requireItem p"),
                            requireAmount = 0;
                            $.each(cartItem,function(){
                                var $this = $(this);
                                requireAmount += parseFloat($this.attr("data-price"));
                            });

                            return requireAmount;
                    },

                /*去购物车*/
                shopCart : function(obj,url){
                    var that =this,
                        $this = $(obj),
                        cartItem = $(".cartlist dt .require,.cartlist dd"),
                        addressValue = $("[data-address]").attr("data-address").split(","),
                        serviceid = $("[data-serviceid]").attr("data-serviceid"),
                        categorycode = $("[data-tagcode]").attr("data-tagcode"),
                        tempGroup = {},
                        list = [],
                        srid = $("[data-srid]").attr("data-srid"),
                        categorycode = $("[data-categorycode]").attr("data-categorycode"),
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
                }

        };

        new Cartinfo;
    })
}(requirejs)
