
/**
 * Created by Administrator on 2015/12/25 0025.
 */
(function(requirejs) {
    'use strict';
    requirejs(['jquery', 'ajax', 'common', 'formVerified', 'addressBox', 'handlebars', 'paginate', 'dial', 'info', 'dialog', 'addrsCtrl', 'chosen','placeholder','message'], function($, Ajax, common, FormVerified, addressBox, Handlebars, Paginate, dial, info, dialog, addrsCtrl, chosen,placeholder,Message) {
        var Sphome = function() {
            this.$category = $(".search-content .category >li:not(':last')");
            this.info = info;
            this.$detailInfo = $("#coupon-info .coupon-popover");
            this.sortfield = $(".category [data-sortfield]");
            this.threelicense = $("#three-terms");
            this.keywords = $("[name='keywords']");
            this.seach = $(".search-bar .search-btn");
            this.messageId = "";
            this.orginTitle = document.title;
            this.titleArr = [];
            this.$messageBox = $('#message-dialog .message-popover');
            this.$isGetTitle = true;
            this.location = window.location.pathname;
            this.search = window.location.search;
            this.init();
        };

        Sphome.ZINDEX = 900;

        Sphome.COUPONNAME = {
            "0": "赠券",
            "1": "折扣",
            "2": "直减",
            "3": "一口价"
        };

        Sphome.COUPONCLASS = {
            "0": "",
            "1": "coupon-blue",
            "2": "coupon-orange",
            "3": "coupon-green"
        };

        Sphome.prototype = {
            init: function() {
                var that = this,
                    servicerVt = new FormVerified(document.getElementById("consultForm"), function() {
                        that.addPurpose();
                    }, false);

                $("select").chosen();

                this.registerHHelper();
                this.selectAction();
                this.initForm();
                this.listener();

                // this.queryCouponList();
            },
            listener: function() {
                var that = this;
                // this.filter();

                /*地区选择*/


                /*购买选择区域*/
                $("#top-showAddress").on("click", function() {
                        var $this = $(this);
                        addressBox.show(this, function() {
                            that.setCityCode();
                        });
                    });


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
            },
            initForm : function(){
                        this.threelicense.removeProp('checked');
                        this.keywords.val('');

                    },
            setCityCode: function (params) {
                var that = this,
                    values = $('#top-showAddress').attr('data-value').split(','),
                    params = {
                        province: values[0],
                        city: values[1],
                    },
                    url = "",

                    request = new Ajax("/common/setCitycode.htm", params);


                    request.done(function (data) {
                        if (data.status === "200") {
                             that.setCookie({'provinceName': data.re.provinceCN});
                            that.setCookie({'cityName': data.re.cityCN});
                            that.setCookie({'provinceCode': data.re.province});
                            that.setCookie({'cityCode': data.re.city});

                            if(that.search.indexOf("&tagcode") >-1){
                                url = "?province="+data.re.province+"&city="+data.re.city+"&district="+that.search.substring(that.search.indexOf("&tagcode"));
                            }else{
                                url = "?province="+data.re.province+"&city="+data.re.city+"&district=";
                            }
                            


                            window.location.href=that.location+url;
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
            sortRet: function(obj) {
                        // console.log(obj)
                var $this = $(obj),
                    field = $this.attr("data-sortfield"),
                    condition = $this.attr("data-condition"),
                    parent = $this.parent(),
                    setTitle='';

                parent.addClass('active').siblings().removeClass('active');

                this.filter();
                if (condition == "desc") {
                    $this.attr("data-condition", "asc");
                } else {
                    $this.attr("data-condition", "desc");
                }

                if(this.$isGetTitle){
                    this.titleArr = this.orginTitle.split("_");
                    this.$isGetTitle =false;
                }

                if(this.titleArr.length == 2 ){
                    if(field == 'hot'){
                        if(condition == 'asc'){
                            setTitle = this.titleArr[0]+"【按热门从低到高】"+"_"+this.titleArr[1];
                        }else{
                            setTitle = this.titleArr[0]+"【按热门从高到低】"+"_"+this.titleArr[1];
                        }
                    }else if(field == 'evaluate'){
                        if(condition == 'asc'){
                            setTitle = this.titleArr[0]+"【按好评从低到高】"+"_"+this.titleArr[1];
                        }else{
                            setTitle = this.titleArr[0]+"【按好评从高到低】"+"_"+this.titleArr[1];
                        }
                    }else{
                        setTitle = this.orginTitle;
                    }

                }else if(this.titleArr.length == 3){
                    if(field == 'hot'){
                        if(condition == 'asc'){
                            setTitle = this.titleArr[0]+"_"+this.titleArr[1]+"【按热门从低到高】"+"_"+this.titleArr[2];
                        }else{
                            setTitle = this.titleArr[0]+"_"+this.titleArr[1]+"【按热门从高到低】"+"_"+this.titleArr[2];
                        }
                    }else if(field == 'evaluate'){
                        if(condition == 'asc'){
                            setTitle = this.titleArr[0]+"_"+this.titleArr[1]+"【按好评从低到高】"+"_"+this.titleArr[2];
                        }else{
                            setTitle = this.titleArr[0]+"_"+this.titleArr[1]+"【按好评从高到低】"+"_"+this.titleArr[2];
                        }
                    }else{
                        setTitle = this.orginTitle;
                    }
                }
                
                
                document.title=setTitle;
            },

            threelicenseRet: function(obj) {

                this.filter();

            },
            searchRet: function() {

                this.filter();

            },

             filter: function () {
                    var that = this,
                        $this = $(this),
                        param = {},
                        addressValue = $("[data-address]").attr("data-address").split(","),
                        checkCat = $(".category > .active em"),   
                        
                        field = checkCat.attr("data-sortfield"),
                        condition = checkCat.attr("data-condition"),
                        threelicenseVal = $("#three-terms").is(":checked") ? 0 : 1,
                        servicername = $.trim($(".keywords").val());


                    this.filterListPaginate = new Paginate({
                        position: "#pbl_pager",
                        anchorPoint: "list-bar",
                        amount: 18,
                        currentPage: 1,
                        pages: 18,
                        data: {
                            pageSize: 18,
                            pageNumber: 1,
                            iscomefromchoose:1,
                            threelicense: threelicenseVal,
                            province: addressValue[0],
                            city: addressValue[1],
                            district: addressValue[2] || '',
                            sortfield: field,
                            ascOrDesc: condition,
                            servicername : servicername
                        },
                        invoke: function () {
                            // console.log(arguments);
                            that.qryList.apply(that,arguments);
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
                },
            /*post ajax data*/
            // formPost: function() {
            //     var that = this;
            //     /*send form data*/
            //     var params = {
            //         content: $.trim(question.content.value),
            //         phone: $.trim(question.phone.value),
            //         username: $.trim(question.username.value),
            //     }

            //     console.log(params);

            //     this.dialog.show({
            //         content: "<div class='info-loading'>处理中，请稍后</div>"
            //     });

            //     $.post('/order/createOrder.htm', params, function(data) {
            //         that.dialog.close();
            //         if (data.status === "200") {
            //             window.location.href = "/forward/go2PageByCode.htm?pageCode=shopSuccess&orderno=" + data.re.orderno;
            //         } else {
            //             that.dialog.show({
            //                 content: data.errormsg
            //             });
            //         };
            //     });
            // },
            registerHHelper: function() {


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
                });

                Handlebars.registerHelper("toFloat", function(value, options) {
                    
                    if(parseInt(value) == value){
                        return parseInt(value)+".0";
                    }else{
                        return value;
                    }
                });

                Handlebars.registerHelper('compare', function (left, operator, right, options) {
                    if (arguments.length < 3) {
                        throw new Error('Handlerbars Helper "compare" needs 2 parameters');
                    }
                    var operators = {
                        '==': function (l, r) {
                            return l == r;
                        },
                        '===': function (l, r) {
                            return l === r;
                        },
                        '!=': function (l, r) {
                            return l != r;
                        },
                        '!==': function (l, r) {
                            return l !== r;
                        },
                        '<': function (l, r) {
                            return l*1 < r*1;
                        },
                        '>': function (l, r) {
                            return l*1 > r*1;
                        },
                        '<=': function (l, r) {
                            return l*1 <= r*1;
                        },
                        '>=': function (l, r) {
                            return l*1 >= r*1;
                        },
                        'typeof': function (l, r) {
                            return typeof l == r;
                        }
                    };

                    if (!operators[operator]) {
                        throw new Error('Handlerbars Helper "compare" doesn\'t know the operator ' + operator);
                    }

                    var result = operators[operator](left, right);

                    if (result) {
                        return options.fn(this);
                    } else {
                        return options.inverse(this);
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
                            // that.messageId = data.re.id;
                            var id = data.re.id,
                            message = new Message();

                            message.show(id,function(){
                                /*回调清空数据*/
                                consultForm.title.value="";
                                consultForm.tel.value="";

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

        }
        new Sphome;
    })
})(requirejs)
