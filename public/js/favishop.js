(function (requirejs) {
    'use strict'; 
    requirejs(['jquery',  'ajax', 'common', 'dialog', 'info', 'handlebars', 'paginate', 'dial'], function ($, Ajax, common, dialog, info, Handlebars, Paginate, dial) {
    	function Favishop () {
            this.favishopPaginate = null;
    		this.init();
    	}

        Favishop.STATUS = "0";

        Favishop.FIELDNAME = {
            "10": "工商",
            "20": "财会",
            "30": "审计",
            "40": "税务",
            "50": "法律",
            "60": "资产评估",
            "70": "行政许可",
            "80": "商标专利",
            "90": "人力资源"
        };

    	Favishop.prototype = {
    		init: function () {
                this.registerHHelper();
    			this.listener();
                this.packageFavishop();
    		},

    		listener: function () {
    			var that = this;
                $('#favishop-list').on('click', 'a[data-role="cancel"]', function () {
                    var obj = this;
                    dialog.show({
                        content: "确定取消关注服务商吗？",
                        buttons: [{
                            name: "取消关注",
                            callBack: function () {
                                that.delCollectServicer($(obj).attr('data-value'));
                                dialog.close();
                            }
                        }, {
                            name: "以后再说",
                            callBack: function () {
                                dialog.close();
                            }
                        }]
                    });
                    
                });
    		},

            delCollectServicer: function (id) {
                var that = this,
                    params = {
                        servicerId: id
                    },
                    request = new Ajax('/user/delMyCollectServicer.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.packageFavishop();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            registerHHelper: function () {
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

            packageFavishop: function (value) {
                var that = this;
                this.favishopPaginate = new Paginate({
                    position: "#ol_pager",
                    anchorPoint: "top-bar",
                    amount: 20,
                    currentPage: 1,
                    pages: 20,
                    data: {
                        pageSize: 20,
                        pageNumber: 1
                    },
                    invoke: function () {
                        that.qryFavishop.apply(that, arguments);
                    }
                });
            },

            qryFavishop: function (paramsObj) {
                var that = this,
                    key = "",
                    params = {},
                    request = null;
                for (key in paramsObj) {
                    params[key] = paramsObj[key];
                }
                delete params.func;
                request = new Ajax('/user/qryMyCollectServicers.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.writeTable(data.re);
                        paramsObj.func(that.favishopPaginate, params.pageSize, params.pageNumber, data.re.totalPage);
                    } else {
                        
                        common.errorDialog(data);
                    }
                });
            },

            writeTable: function (data) {
                var html = "",
                    i = 0,
                    j = 0,
                    iLen = data.servicer.length,
                    item = {},
                    jLen = 0,
                    box = $('#favishop-list'),
                    source = $('#servicer-list-template').html(),
                    template = Handlebars.compile(source);
                box.empty();
                for (i = 0; i < iLen; i += 1) {
                    item = data.servicer[i];
                    if (!item.logo) {
                        item.logo = "/public/img/vendor-placeholder-logo.png";
                    }
                    item.fields = [];
                    if (item.field && item.field !== "") {
                        item.fields = item.field.split(',');
                        for (j = 0, jLen = item.fields.length; j < jLen; j += 1) {
                            item.fields[j] = Favishop.FIELDNAME[item.fields[j]];
                        }
                    }
                }
                if (data.totalRow) {
                    $('#favishop-noResult').hide();
                    html = template(data);
                    $(html).appendTo(box);
                    dial.refresh();
                } else {
                    $('#favishop-noResult').show();
                }
            }  
    	};

    	var favishop = new Favishop();
    });
}(window.requirejs));