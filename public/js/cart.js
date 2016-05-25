/**
 * Created by Administrator on 2015/12/26 0026.
 */
!function(requirejs){
    'use strict';
    requirejs(['jquery','common','dialog','handlebars','chosen','dial','cookie','info'],function($,common,Dialog,Handlebars,chosen,dial,cookie,info){
        var Cart = function(){
            this.$cartlist = $(".cartlist");
            this.$checkedall = $(".shopcart-wrap .checkedall");
            this.$checkbox = $(".cartlist :checkbox");
            this.$delete = $(".cartlist .delete");
            this.$checkedDelete = $("#checked-delete");
            this.dialog =Dialog;
            this.tempServicer = [];
            this.cartSet = [];
            this.userid = "";
            this.referrer = document.referrer;
            this.hash = window.location.hash;
            this.host = window.location.host;
            this.init();

        }

        Cart.prototype = {
            constructor : Cart,
            init : function(){
                this.registerHHelper();

                this.getMyCart();
                this.listener();
            },
            
            listener : function(){
                var that = this;
                
                $(".shopcart-wrap").on("click",".checkedall",function(){
                    that.checkedAll(this);
                });
                $(".shopcart-wrap").on("click",".cartlist h3 :checkbox",function(){
                    that.everyChecked(this);
                });
                $(".shopcart-wrap").on("click",".delete",function(){
                    that.erveryDeleteOk(this);
                });
                $(".shopcart-wrap").on("click","#checked-delete",function(){
                    that.checkedDeleteOk();
                });
                $(".shopcart-wrap").on("click",".cartlist [data-type='1'] input",function(){
                    that.radioCheck(this);
                })
                $(".shopcart-wrap").on("click",".cartlist [data-type='2'] .btn.ok",function(){
                    that.checkboxCheck(this);
                });
                $(".shopcart-wrap").on("click",".cartlist [data-type='2'] .btn.cancel",function(){
                    that.closeOptionDialog(this,true);
                })
                $(".shopcart-wrap").on("click",".cartlist [data-type='2'] input",function(){
                    that.checkboxSelect(this);
                })
                $(".shopcart-wrap").on("click",".cartlist .alter",function(){
                    that.showOption(this);
                })

                /*数量增减*/
                $(".shopcart-wrap").on("click",".increase,.decrease",function(){
                    that.changeQuantity(this);
                });

                /*键盘改变数量*/
                $(".shopcart-wrap").on("blur",".quan",function(){
                    that.keyQuantity(this);
                });

                /*付款方式改变 */
                $(".shopcart-wrap").on("change",".chosn_options",function(){
                    that.changePay(this);
                });

                /*确定最终的价格*/
                 $(".shopcart-wrap").on("click","[name='coupon']",function(){
                    that.getChangeCoupon(true);

                })
                /*结算*/
                $(".shopcart-wrap").on("click",".btn-shop",function(){
                    that.goPay();
                });

                /*关闭规格框*/
                $(".shopcart-wrap").on("click",".cartlist [data-type='2'] em",function(){
                        that.closeOptionDialog(this,true);
                });
                $(".shopcart-wrap").on("click",".cartlist [data-type='1'] em",function(){
                        that.closeOptionDialog(this);
                });

            },
            /*关闭规格框*/
            closeOptionDialog:function(obj,options){
                var $this = $(obj),
                    optionDialog = $this.parents(".options"),
                    aLi = optionDialog.find("li");


                    if(options === true){
                        $.each(aLi,function(){
                            var $this = $(this);

                            if($this.attr("data-orignselected") === "1"){
                                $this.attr("data-isselected","1");
                                $this.find(":checkbox").prop("checked",true);
                            }else{
                                $this.attr("data-isselected","0");
                                $this.find(":checkbox").prop("checked",false);
                            }
                        })
                    }
                    optionDialog.hide();
            },

            /*跳去下单页*/
            goPay : function(){
                // console.log(this.cartSet)
                var checkbox = $(".shopcart-wrap .itemCheck:checked"),
                    aLi = checkbox.parents(".item").find("[data-id]"),
                    giftCardIdsDirect = $(".coupon").find("em[data-id]"),
                    couponid = $("[name=coupon]:checked").attr("data-id"),
                    ids = [],
                    giftIds=[],
                    willGiftIds = [],
                    data = "";


                    $.each(aLi,function(){
                        var $this = $(this);
                        ids.push($this.attr("data-id"));
                    });
                    $.each(giftCardIdsDirect,function(){
                        var $this = $(this);
                        giftIds.push($this.attr('data-id'));
                        willGiftIds.push($this.attr('data-willgift'));
                    });
                    if(couponid){
                        data = "couponid="+couponid+"&showIds="+ids.join(",")+"&giftIds="+giftIds.join(",")+"&willGift="+willGiftIds.join(",");
                    }else{
                        data = "showIds="+ids.join(",")+"&giftIds="+giftIds.join(",")+"&willGift="+willGiftIds.join(",");
                    }

                if(checkbox.length == 0){
                    this.dialog.show({
                        content : "请选择你需要购买的服务，再去结算！"
                    })
                }else{
                    this.setCheckCookie();
                    window.location.href="/app/cartlist.html?"+data;
                }

            },

            /*计算总价格*/
            calculatAmount : function(){
                var item = $(".cartlist h3 :checkbox:checked").parents(".item").find("[data-id]"),
                    totalAmount = $("[data-totalamount]"),
                    totalserivce = $("[data-totalserivce]"),
                    sumPrice= $(".sumPrice em"),
                    totalRePrice= $(".totalRePrice em"),
                    couponPrice = parseFloat($("[name=coupon]:checked").val()) || 0,
                    iQuan = 0,
                    iAmount = 0;
                    $.each(item,function(){
                        var $this = $(this),
                            quantity = parseFloat($this.find("[data-quantity]").attr("data-quantity")),
                            amount = parseFloat($this.find("[data-amount]").attr("data-amount"));
                            iAmount += amount;
                            iQuan += quantity;


                    })


                totalAmount.html(iAmount.toFixed(2)); 
                totalserivce.html(iQuan); 
                sumPrice.html((iAmount-couponPrice).toFixed(2));
                totalRePrice.html(couponPrice.toFixed(2));

            },
            /*改变支付*/

            changePay : function(obj){
                var $this = $(obj);

                    $this.attr("data-paytype",$this.val());

                    this.changeCart(obj,true);


            },
            /*选择规格*/
            radioCheck : function(obj){
                var $this = $(obj),
                    optionsBox = $this.parents(".options");
                    optionsBox.hide();
                    $this.parents("li").attr("data-isseleceted","1").siblings('li').attr("data-isseleceted","0");
                    this.changeCart(obj);
            },
            /* 规格多先【*/
            checkboxCheck : function(obj){
                var $this = $(obj),
                    input = $this.parents("ul").find(":checkbox:checked"),
                    optionsBox = $this.parents(".options");

                    if(input.length == 0){
                       this.dialog.show({
                        content : "必须一项规格"
                       });
                       return;
                    }

                    optionsBox.hide();

                    this.changeCart(obj);
            },

            checkboxSelect : function(obj){
                var $this = $(obj);
                if($this.is(":checked")){
                    $this.parents("li").attr("data-isseleceted","1")
                }else{
                    $this.parents("li").attr("data-isseleceted","0")

                }
            },
            /*显示选择*/
            showOption : function(obj){
                var $this = $(obj);

                    $this.next().show();
            },
            /*初始化*/
            // getMyCart : function(){
            //     var that = this;
            //     var tpl = Handlebars.compile($("#shop-tpl").html());
            //     var cartnextTpl = Handlebars.compile($("#cartnext-tpl").html());
                

            //     $.ajax({
            //         type : "POST",
            //         url : "/cart/getMyCart.htm",
            //         dataType : "json"
            //     }).done(function(data){
            //         if(data.status == 200){
            //             if(data.re.cartList.length > 0){

            //                 var ret = data.re;
                                
            //                 $(".shopcart-wrap").empty();
            //                 $(".shopcart-wrap").append(tpl(ret));

            //                 // that.checkEachOption();

            //                 $('select').chosen();
            //                 dial.refresh();
            //                 /*初始化保存不变的*/
            //                 that.userid = ret.cartList.length > 0 ? ret.cartList[0].items[0].userid : "-1";
            //                 that.getCoupon(that.createTempItem()).done(function(data){
            //                     if(data.status == 200){
            //                         var couponSet = data.re;


            //                         $(".cart-next").empty();
            //                         $(".cart-next").append(cartnextTpl(couponSet));
            //                         /*判断全选*/


            //                         // if($.cookie("flagcookie")!==undefined){
            //                         //     that.checkEachOption();
            //                         //     that.checkALLOption();
            //                         //     $.cookie("flagcookie",'',{ expires: -1 });
            //                         // }

            //                         /*计算总价格*/
            //                         that.calculatAmount();
            //                     }else{
            //                         that.dialog.show({
            //                             content:data.errormsg
            //                         })
            //                     }

            //                 });

            //             }else{
            //                 that.cartEmpty();
            //             }
            //         }
            //     })
            // },

            getMyCart:function(){
                var that = this;
                var tpl = Handlebars.compile($("#shop-tpl").html());
                var cartnextTpl = Handlebars.compile($("#cartnext-tpl").html());
                

                $.ajax({
                    type : "POST",
                    url : "/cart/getMyCart.htm",
                    dataType : "json"
                }).done(function(data){
                    if(data.status == 200){
                        if(data.re.cartList.length > 0){

                            var ret = data.re;
                                
                            $(".shopcart-wrap").empty();
                            $(".shopcart-wrap").append(tpl(ret));
                            if(that.hash.indexOf("back") > -1){

                                that.checkEachOption();
                            }

                            $('select').chosen();
                            dial.refresh();
                            /*初始化保存不变的*/
                            that.userid = ret.cartList.length > 0 ? ret.cartList[0].items[0].userid : "-1";
                            that.getCoupon(that.createTempItem()).done(function(data){
                                if(data.status == 200){
                                    var couponSet = data.re;


                                    $(".cart-next").empty();
                                    $(".cart-next").append(cartnextTpl(couponSet));
                                    /*判断全选*/

                                    if(that.hash.indexOf("back") > -1){

                                        that.checkALLFalse();
                                    }

                                    /*计算总价格*/
                                    that.calculatAmount();
                                }else{
                                    that.dialog.show({
                                        content:data.errormsg
                                    })
                                }

                            });

                        }else{
                            that.cartEmpty();
                        }
                    }
                })
            },

            checkEachOption : function(){
                var srids = $.cookie("srids"),
                    sridArr = srids ? srids.split(","):"";

                    $(".cartlist h3 :checkbox").prop("checked",false);

                    if(srids){
                        $.each(sridArr,function(key,value){
                            $("[data-uniqueid='"+value+"'] input").prop("checked",true);
                        });

                    }else{
                        $(".cartlist h3 :checkbox").prop("checked",true);
                    }

                    
            },

            checkALLFalse : function(){
                var inputLen =0,
                    inputChkLen = 0;

                    inputLen = $(".cartlist h3 :checked").length;
                    inputChkLen = $(".cartlist h3 :checkbox").length;

                    if(inputChkLen !== inputLen){
                        $(".checkedall").prop("checked",false);
                    }

            },

            checkAllTrue : function(){
                var inputLen =0,
                    inputChkLen = 0;

                    inputLen = $(".cartlist h3 :checked").length;
                    inputChkLen = $(".cartlist h3 :checkbox").length;

                    if(inputChkLen === inputLen){
                        $(".checkedall").prop("checked",true);
                    }
            },

            setCheckCookie : function(){
                var $sridArr = [],
                    $checkbox = $(".cartlist h3 :checked"),
                    $srid = $checkbox.parent();
                    
                    $.each($srid,function(){
                        $sridArr.push($(this).attr("data-uniqueid"));
                    });
                    $sridArr = $sridArr.toString();

                    $.cookie("srids",$sridArr,{expires:7});
            },
            cartEmpty : function(){
                $(".shopcart-wrap").empty().hide();
                $(".cart-wrapper").show();
            },
            /*优惠券组装*/
            getCoupon : function(json,radio){

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

                var tpl = Handlebars.compile($("#coupon-tpl").html()),
                    couponids = $("[name=coupon]:checked").attr("data-id") || '';


                var deferred = $.ajax({
                    type : "POST",
                    url : "/cart/getMyCoupon.htm",
                    dataType : "json",
                    beforeSend :function(){
                        that.showMask();
                    },
                    complete : function(){
                        that.hideMask();
                    },
                    data : {
                        cartList : JSON.stringify(cartList),
                        couponids :radio ? couponids : ""
                    }
                }).fail(function(){
                    // that.dialog.show({
                    //     content : "系统繁忙,请稍后再试"
                    // })
                });
                return deferred;
            },
            showMask : function(){
                var html = [],
                    w  = $(document).width(),
                    h= $(document).height(),
                    style = "position:fixed;width:"+w+"px;height:"+h+"px;top:0;left:0;z-index:10000001",
                    maskStyle = "position:fixed;width:"+w+"px;height:"+h+"px;top:0;left:0;z-index:10000000;background-color:#000;opacity:.5;filter:alpha(opcity=50)",
                    loadMask = "<div class='loading_mask_div' style='"+maskStyle+"'></div>";


                    html.push("<div class='loading_content' style='"+style+"'>");
                    html.push("<div style='width:84px;height:84px;position:absolute;left:50%;top:400px;margin-left:-42px;text-align:center;font-size:20px'>");
                    html.push("<p style='background:url(../public/img/loading_alpha.gif);width:100%;height:100%;margin-bottom:10px;'></p>");
                    html.push("</div>");
                    html.push("</div>");

                    $("body").append(loadMask);
                    $("body").append(html.join(""));

            },
            hideMask : function(){
                $(".loading_content").hide();
                $(".loading_mask_div").hide();
            },
            /*传入优惠券*/
            getChangeCoupon : function(radio){
                var that =this
                    
                
                var couponTpl = Handlebars.compile($("#coupon-tpl").html());
                this.getCoupon(this.createTempItem(),radio).done(function(data){
                    if(data.status == 200){
                        var couponSet = data.re;
                        if(!radio){

                            $(".cart-next .coupon").empty();
                            $(".cart-next .coupon").append(couponTpl(couponSet));
                        }

                        /*计算总价格*/
                        that.calculatAmount();
                    }else{
                        that.dialog.show({
                            content:data.errormsg
                        })
                    }

                });

            },

            createTempItem : function(){
                var that =this,
                    tempArr = [],
                    $itemList = $(".cartlist h3 :checkbox:checked").parents(".item");

                    $.each($itemList,function(){

                        var tempJson = {},
                            $this = $(this),
                            aLi = $this.find("[data-id]"),
                            parent = $this.find("h3"),
                            contracts = $this.find("[data-contracts]");

                            tempJson.citycode = parent.attr("data-citycode");
                            tempJson.provincecode = parent.attr("data-provincecode");
                            tempJson.srid =parent.attr("data-srid");
                            tempJson.srname =parent.attr("data-srname");
                            tempJson.districtcode =parent.attr("data-districtcode");
                            tempJson.servicer_contracts =parent.attr("data-contracts");

                            tempJson.items=[];
                            $.each(aLi,function(){
                                var $item = $(this),

                                siid = $item.attr("data-siid"),
                                srsid = $item.attr("data-srsid"),
                                city = $item.find("[data-city]").attr("data-city"),
                                province = $item.find("[data-province]").attr("data-province"),
                                price = $item.find(".item-price").attr("data-price"),
                                unitname = $item.find("[data-unitname]").attr("data-unitname"),
                                sdid = $item.attr("data-sdid"),
                                siname = $item.find("[data-siname]").attr("data-siname"),
                                id = $item.attr("data-id"),
                                quantity = $item.find("[data-quantity]").attr("data-quantity"),
                                payTypes = $item.find("[data-payTypes]").attr("data-payTypes"),
                                paytype =$item.find("[data-paytype]").attr("data-paytype"),
                                sdname = $item.find("[data-sdname]").attr("data-sdname"),
                                unit = $item.find("[data-unit]").attr("data-unit"),
                                district =$item.find("[data-district]").attr("data-district"),
                                modifynum =$item.attr("data-modifynum"),
                                account =$item.attr("data-account"),
                                itemgroupid =$item.attr("data-itemgroupid"),
                                itemgroupname =$item.attr("data-itemgroupname"),
                                options = $item.find(".option-items .options"),
                                optionsArr = [];

                                 $.each(options,function(){
                                    var optionsJson = {},
                                        $this = $(this),
                                         aLi = $this.find("li");
                                    optionsJson.ssoid = $this.attr("data-ssoid");
                                    optionsJson.ssdid =$this.attr("data-ssdid");
                                    optionsJson.specdefinename=$this.attr("data-specdefinename");
                                    optionsJson.type=$this.attr("data-type");
                                    optionsJson.options = [];
                                    $.each(aLi,function(){
                                        $this = $(this);
                                        optionsJson.options.push({
                                            unit : $this.attr('data-unit'),
                                            isSeleceted :$this.attr('data-isseleceted'),
                                            price :$this.attr('data-price'),
                                            optionname :$this.attr('data-optionname'),
                                            sort :$this.attr('data-sort'),
                                        })
                                    });

                                    optionsArr.push(optionsJson);
                                });
                                
                                tempJson.items.push({
                                    siid : siid,
                                    srsid : srsid,
                                    city : city,
                                    province : province,
                                    price : price,
                                    unitname : unitname,
                                    sdid : sdid,
                                    siname : siname,
                                    id : id,
                                    quantity : quantity,
                                    payTypes : payTypes,
                                    paytype : paytype,
                                    sdname : sdname,
                                    unit : unit,
                                    district :district,
                                    modifynum :modifynum,
                                    account :account,
                                    itemgroupid :itemgroupid,
                                    itemgroupname :itemgroupname,
                                    options :optionsArr

                                });

                            });


                        tempArr.push(tempJson);
                    });
                
                return tempArr;
            },
            
            /*加减改变数量*/
            changeQuantity : function(obj){
                var $this = $(obj),
                    quantity = $this.parent("p").find(".quan"),
                    val = parseInt(quantity.val()),
                    amount = $this.parents("li").find("[data-amount]"),
                    price = parseFloat($this.parents("li").find(".item-price").attr("data-price"));
                    if($this.is(".increase")){
                        if(val < 99){
                            val += 1;
                           
                        }

                    }else if($this.is(".decrease")){
                        if(val > 1){
                            val -= 1;
                           
                        }
                    }
                    quantity.attr("data-quantity",val);
                    amount.html(price*val);
                    amount.attr("data-amount",price*val);
                    this.changeCart(obj);
                    quantity.val(val);
            },
            /*键盘改变 数量 */
            keyQuantity : function(obj){
                var that = this,
                    $this = $(obj),
                    quantity = $this.parent("p").find(".quan"),
                    val = parseInt(quantity.val());
                    if(val < 1 || val > 99){
                        quantity.attr("data-quantity",1);
                        quantity.val(1);
                        this.dialog.show({
                            content : "服务购买数量不允许超过100件" 
                        })
                    }else{
                        quantity.attr("data-quantity",val);obj
                        quantity.val(val);
                        this.changeQuantity(obj);

                    }
            },
            /*修改购物车*/
            changeCart : function(obj,nochangeCoupon){
                var that = this,
                    itemObj = {},
                    $item = $(obj).parents("[data-siid]"),
                    $parent = $(obj).parents(".item").find("h3"),
                    siid = $item.attr("data-siid"),
                    srsid = $item.attr("data-srsid"),
                    city = $item.find("[data-city]").attr("data-city"),
                    userid = $("[data-userid]"),
                    srid = $parent.attr("data-srid"),
                    citycode = $parent.attr("data-citycode"),
                    province = $item.find("[data-province]").attr("data-province"),
                    price = $item.find(".item-price").attr("data-price"),
                    unitname = $item.find("[data-unitname]").attr("data-unitname"),
                    options = $item.find(".option-items .options"),
                    optionsArr = [],
                    sdid = $item.attr("data-sdid"),
                    siname = $item.find("[data-siname]").attr("data-siname"),
                    id = $item.attr("data-id"),
                    servicer_contracts = $parent.find("[data-contracts]").attr("data-contracts"),
                    districtcode = $parent.attr("data-districtcode"),
                    srname =$parent.attr("data-srname"),
                    quantity = $item.find("[data-quantity]").attr("data-quantity"),
                    payTypes = $item.find("[data-payTypes]").attr("data-payTypes"),
                    paytype =$item.find("[data-paytype]").attr("data-paytype"),
                    sdname = $item.find("[data-sdname]").attr("data-sdname"),
                    unit = $item.find("[data-unit]").attr("data-unit"),
                    provincecode = $parent.attr("data-provincecode"),
                    district =$item.find("[data-district]").attr("data-district"),
                    modifynum =$item.attr("data-modifynum"),
                    account =$item.attr("data-account");

                    // 复位标志位
                    this.requireGroup = {};
                    this.requireFlag = {};
                    this.requireJson = {};
                    this.uniqueJson = {};

                    $.each(options,function(){
                        var optionsJson = {},
                            $this = $(this),
                             aLi = $this.find("li");
                        optionsJson.ssoid = $this.attr("data-ssoid");
                        optionsJson.ssdid =$this.attr("data-ssdid");
                        optionsJson.specdefinename=$this.attr("data-specdefinename");
                        optionsJson.type=$this.attr("data-type");
                        optionsJson.options = [];
                        $.each(aLi,function(){
                            $this = $(this);
                            optionsJson.options.push({
                                unit : $this.attr('data-unit'),
                                isSeleceted :$this.attr('data-isseleceted'),
                                price :$this.attr('data-price'),
                                optionname :$this.attr('data-optionname'),
                                sort :$this.attr('data-sort'),
                            })
                        });

                        optionsArr.push(optionsJson);
                    });

                itemObj = {
                    siid : siid,
                    srsid : srsid,
                    city : city,
                    userid : this.userid,
                    srid : srid,
                    citycode : citycode,
                    province : province,
                    price : price,
                    unitname : unitname,
                    options : optionsArr,
                    sdid : sdid,
                    siname : siname,
                    id : id,
                    servicer_contracts : servicer_contracts,
                    districtcode : districtcode,
                    srname :srname,
                    quantity : quantity,
                    payTypes : payTypes,
                    paytype : paytype,
                    sdname : sdname,
                    unit : unit,
                    provincecode : provincecode,
                    district :district,
                    modifynum :modifynum,
                    account :account
                }


                $.ajax({
                    type : "POST",
                    url : "/cart/changeMyCart.htm",
                    dataType : "json",
                    data : {
                        itemObj : JSON.stringify(itemObj)
                    }
                }).done(function(data){
                    if(data.status == 200){

                        !nochangeCoupon && that.getMyCart();
                    }else{
                        that.dialog.show({
                            content:data.errormsg
                        })
                    }
                })
            },
            /*全选*/
            checkedAll : function(obj){
                var $this = $(obj),
                    $checkedall = $(".shopcart-wrap .checkedall"),
                    $checkbox = $(".cartlist h3 :checkbox");


                if($this.prop("checked")){
                    $checkedall.prop("checked",true);
                    $checkbox.prop("checked",true);
                    
                }else{
                    $checkedall.prop("checked",false);
                    $checkbox.prop("checked",false);
                }

                this.setCheckCookie();
                this.getChangeCoupon();

            },
            /*每个服务商选*/
            everyChecked : function(obj){
                var $this = $(obj),
                    checkedFlag = true,
                    $checkedall = $(".shopcart-wrap .checkedall"),
                    $checkbox = $(".cartlist h3 :checkbox");

                $checkbox.each(function(){

                    var srid = $(this).parent().attr("data-srid");

                    if(!$(this).prop("checked")){
                        checkedFlag = false;
                        return false;
                    }
                });

                if($this.prop("checked")){
                    if(checkedFlag){
                        $checkedall.prop("checked",true);
                    }
                }else{
                    $checkedall.prop("checked",false);
                }
                this.setCheckCookie();
                this.getChangeCoupon();
            },
            /*删除全部*/
            checkedDeleteOk : function(){
               var checkedItem = $(".cartlist :checkbox:checked").parents(".item");
                if(!checkedItem.length){
                    this.dialog.show({
                        content : '请选择要删除的服务项',
                    });
                    return;
                }   
                this.deleteBox(null,1);
            },
            /*每项删除*/
            erveryDeleteOk :function(obj){
                this.deleteBox(obj,2);
            },
            /*删除框*/
            deleteBox : function(obj,option){
                var that =this,
                    $this = $(obj),
                    oTarget = $this.parents("tr"),
                    promotion = oTarget.attr("data-ispromotion"),
                    itemrequired = oTarget.attr("data-itemrequired")==true?true:false,
                    isGroup = $this.attr("data-deleteid")?true:false,
                    deleteMsg = '删除服务';

                    if(isGroup || itemrequired){
                        deleteMsg = "此项为套餐项或必选项，需删除整个服务";
                    }

                this.dialog.show({
                    title : '删除',
                    content : deleteMsg,
                    buttons:[{
                        name:"ok",
                        callBack:function(){
                            if(option == 1){

                                that.checkedDelete(obj);
                            }else if(option == 2){

                                that.everyDelete(obj);
                            }
                            that.dialog.close();
                        }
                    }]

                });
            },
            checkedDelete:function(obj){
                var that =this,
                    checkedItem = $(".cartlist h3 :checkbox:checked").parents(".item"),
                    ids = [],
                    aLi = checkedItem.find("[data-siid]");

                    $.each(aLi,function(){
                        var $this = $(this);

                        ids.push($this.attr("data-id"));
                    })
                    ids = ids.join(",");
                    this.deleteAjax(ids).done(function(data){
                        if(data.status == 200){
                            /*如果同一个服务多1条记录*/
                            checkedItem.remove();
                            if($(".cartlist .item").length == 0){
                                that.cartEmpty();
                                }
                            that.setCheckCookie();
                            that.checkAllTrue();
                            that.getChangeCoupon();
                        }else{
                            that.dialog.show({
                                title : '提示信息',
                                content : '删除失败，请稍后再试'

                            });
                        }
                    })


            },
            /*每个删除*/
            everyDelete : function(obj){    
               var that = this,
                    $this = $(obj),
                   oTarget = $this.parents("tr"),
                   isGroup = $this.attr("data-deleteid")?true:false,
                   ids = $this.attr("data-deleteid")?$this.attr("data-deleteid"):oTarget.attr("data-id"),
                   sdid = oTarget.attr("data-sdid"),
                   oParent = $this.parents("tbody"),
                   itemrequired = oTarget.attr("data-itemrequired")=="1" ? true : false,
                   iLen = 0 ,
                   oTargetList = null,
                   oItem = $this.parents(".item");



                   /*如果是必选服务，删除整个服务*/

                   if(isGroup || itemrequired){
                        oTargetList = oTarget.siblings('[data-sdid="'+sdid+'"]').addBack();
                   };


                    this.deleteAjax(ids).done(function(data){
                        if(data.status == 200){
                            /*如果同一个服务多1条记录*/

                            if(isGroup || itemrequired){
                                oTargetList.remove();
                                
                                 iLen=oParent.children("tr").length;


                                if(!iLen){
                                    oItem.remove();
                                }
                            }else{
                                oTarget.remove();

                                 iLen=oParent.children("tr").length;


                                if(!iLen){
                                    oItem.remove();
                                }
                            }

                            // that.checkALLOption();
                            if($(".cartlist .item").length == 0){
                                that.cartEmpty();
                                }
                            that.setCheckCookie();
                            that.checkAllTrue();
                            that.getChangeCoupon();
                        }else{
                            that.dialog.show({
                                title : '提示信息',
                                content : '删除失败，请稍后再试'

                            });
                        }
                    })

            },

            /*删除*/
            deleteAjax : function(ids){
                var that = this;
                return $.ajax({
                    type : "POST",
                    url : "/cart/deleteMyCart.htm",
                    data : {
                        ids : ids
                    },
                    dataType : "json"
                }).fail(function(){
                    that.dialog.show({
                        title : '提示信息',
                        content : '网络繁忙，请稍后再试'

                    });
                })
            },
            requireGroup : {},
            requireFlag : {},
            requireJson : {},
            uniqueJson : {},
            noCoupon : true,

            /*自定义helper*/
            registerHHelper: function() {
                var that = this;

                    /*计算每个的总价格*/

                    Handlebars.registerHelper("toAmount", function(q,p, options) {

                        return parseFloat(q)*parseFloat(p);
                    });

                    Handlebars.registerHelper("deleteList", function(value,value1,options) {

                        var sdid = value.sdid,
                            srid = value1.srid,
                            districtcode = value1.districtcode;

                            that.requireGroup[srid] = {};
                            that.requireGroup[srid][sdid] = {};
                            that.requireGroup[srid][sdid][districtcode] = {};
                            

                        if(value.ispromotion =="1"){
                           if(!that.requireJson[srid+sdid+districtcode]){
                                    that.requireJson[srid+sdid+districtcode] = {};
                                    that.requireGroup[srid][sdid][districtcode].deleteid= [];
                                     $.each(value.groups,function(k0,v0){
                                                    that.requireGroup[srid][sdid][districtcode].deleteid.push(v0.items[0].id);
                                                })

                                    return options.fn({
                                            rowspan : value.groups.length,
                                            deleteid: that.requireGroup[srid][sdid][districtcode].deleteid.join(",")
                                        });
                                }
                        }else{

                            $.each(value.groups,function(k1,v1){
                                if(v1.itemrequired =="0"){
                                    that.requireGroup[srid][sdid][districtcode].requireFlag = false;
                                    return false;
                                }
                            });
 

                            if(that.requireGroup[srid][sdid][districtcode].requireFlag === undefined){

                                if(!that.requireJson[srid+sdid+districtcode]){
                                    that.requireJson[srid+sdid+districtcode] = {};
                                    that.requireGroup[srid][sdid][districtcode].deleteid= [];
                                     $.each(value.groups,function(k0,v0){
                                                    that.requireGroup[srid][sdid][districtcode].deleteid.push(v0.items[0].id);
                                                })

                                    return options.fn({
                                            rowspan : value.groups.length,
                                            deleteid: that.requireGroup[srid][sdid][districtcode].deleteid.join(",")
                                        });
                                }

                                
                            }else{
                                return options.fn({
                                    rowspan :1
                                })
                            }

                        }

                    });

                    Handlebars.registerHelper("showCoupon", function(value,options) {


                        if(value.giveCoupons || value.showCouponSet){

                            if(value.giveCoupons.length || value.showCouponSet.length){
                                return options.fn(this);
                            }
                        }
                        
                    });
                    Handlebars.registerHelper("addNoCoupon", function(value,index,parent,options) {
                        
                        var isReachLength = 0;                

                        $.each(parent.showCouponSet,function(k,v){
                          if(v.isReach === true){
                            isReachLength++;

                          }  
                        })

                        if(index === isReachLength-1){
                            return  options.fn(this);
                        }
                                
                    });

                    Handlebars.registerHelper("toCouponList", function(value,options) {


                       var html = [];
                        if(value.length){
                            $.each(value,function(k1,v1){
                                html.push(v1.id);
                            });

                            return html.join(",")

                        }
                        
                    });

                    /*付款方式*/
                    Handlebars.registerHelper("toPayTypes", function(value,value2,options) {

                        var type = value.split(","),
                            html = [],
                            payJson = {};
                            
                            // console.log(value2);
                        $.each(type,function(key,value){
                            var typeVal = "",
                                selected="";
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

                            if(value == value2){
                                selected= "selected";
                            }


                            html.push(options.fn({
                                type : value,
                                value : typeVal,
                                selected : selected
                            }))
                        })

                        return html.join("");

                    });

                    Handlebars.registerHelper("toDefaultType", function(value, options) {
                        /*付款方式*/
                        var type = value.split(",")[0],
                            typeVal = "";
                            switch (type) {
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
                        // console.log(this.options)
                        var optionArr = this.options,
                            radioname = "radio"+radioIndex,
                            checkboxname = "chekcbox"+checkboxIndex,
                            html = "",
                            radioFlag = true,
                            checkboxFlag = true;
                        if(value == 1){
                            $.each(optionArr,function(key,value){
                                var checked = "";
                                $.each(optionArr,function(k2,v2){
                                    if(v2["isSeleceted"] == 1){
                                        radioFlag= false;
                                    }
                                })
                                if(radioFlag){
                                    if(key == 0){
                                        checked="checked";
                                        html += options.fn({
                                            optionname : value["optionname"],
                                            price : value["price"],
                                            unit : value["unit"],
                                            isSeleceted : 1,
                                            sort : value["sort"],
                                            radioname : radioname,
                                            checked : checked
                                        });
                                    }else{
                                        html += options.fn({
                                            optionname : value["optionname"],
                                            price : value["price"],
                                            unit : value["unit"],
                                            isSeleceted : 0,
                                            sort : value["sort"],
                                            radioname : radioname,
                                            checked : checked
                                        });
                                    }
                                }else{
                                    if(value["isSeleceted"] == 1){
                                        checked="checked";
                                    }
                                    html += options.fn({
                                        optionname : value["optionname"],
                                        price : value["price"],
                                        unit : value["unit"],
                                        isSeleceted : value["isSeleceted"],
                                        sort : value["sort"],
                                        radioname : radioname,
                                        checked : checked
                                    });
                                }


                            });
                            radioIndex++;
                        }else if(value == 2){
                             $.each(optionArr,function(key,value){
                                var checked = "";
                                $.each(optionArr,function(k2,v2){
                                    if(v2["isSeleceted"] == 1){
                                        checkboxFlag= false;
                                    }
                                });

                                if(checkboxFlag){
                                    if(key == 0){
                                        checked="checked";
                                        html += options.inverse({
                                        optionname : value["optionname"],
                                        price : value["price"],
                                        unit : value["unit"],
                                        isSeleceted : 1,
                                        sort : value["sort"],
                                        checkboxname : checkboxname,
                                        checked : checked
                                    });
                                    }else{
                                        html += options.inverse({
                                        optionname : value["optionname"],
                                        price : value["price"],
                                        unit : value["unit"],
                                        isSeleceted : 0,
                                        sort : value["sort"],
                                        checkboxname : checkboxname,
                                        checked : checked
                                    });
                                    }
                                }else{

                                    if(value["isSeleceted"] == 1){
                                        checked="checked";
                                    }
                                    html += options.inverse({
                                        optionname : value["optionname"],
                                        price : value["price"],
                                        unit : value["unit"],
                                        isSeleceted : value["isSeleceted"],
                                        sort : value["sort"],
                                        checkboxname : checkboxname,
                                        checked : checked
                                    });
                                }
                            })
                                html +='<p class="btnGroup"><button class="btn btn-primary ok">确定</button><button class="btn btn-primary cancel">取消</button></p>';
                                checkboxIndex++;
                        }
                            
                            return html;

                    })

                    Handlebars.registerHelper("unReach", function(value, options) {
                        var tips = this["tips"],
                            type = "";
                        switch (this.resultList[0].resultSubType) {
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

                    Handlebars.registerHelper("setCouponType", function(value, options) {
                        var type = "";
                        switch (value) {
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

                        return type;
                    })

                    Handlebars.registerHelper("checkedType", function(value, options) {
                        if(value == 1){
                            return 'checked';
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
                           if(Number(value)){
                            return options.fn({
                                discount  : this.discount

                            })
                           }
                    })

                    Handlebars.registerHelper("toUnique", function(value, options) {
                           // console.log(value);
                           if(!that.uniqueJson[value]){
                            that.uniqueJson[value] = {};
                            that.uniqueJson[value].index = 0;
                           }else{
                                that.uniqueJson[value].index++;
                               
                           }

                            return "srid_"+value+"_"+that.uniqueJson[value].index;

                    })

                     Handlebars.registerHelper("getType", function(value, options) {
                        var html = [];
                        $.each(value,function(k,v){
                            if(v['isSeleceted'] ==1){
                                html.push(v['optionname']);
                            }
                        })

                        return html.join(",");
                    })
                }
        };

        return new Cart;
    })
}(requirejs)