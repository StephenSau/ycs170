(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'dialog', 'info', 'tab'], function ($, Ajax, common, dialog, info) {
    	function Cashier () {
    		this.ordernos = common.getParams('ordernos').split(',');
    		this.itemIds = common.getParams('itemIds');
    		this.amount = common.getParams('amount');
    		this.aliBox = $('#cashiser-alibox');
    		this.hasCode = false;
    		this.init();
    	}

    	Cashier.TIMEFLAG = null;

    	Cashier.prototype = {
    		init: function () {
    			var that = this;
    			$('#cashier-tab').tab({
    				callback: function(obj) {
    					if (obj.attr('data-target') === "wechat-pay") {
    						that.wxAction();
    					}
    				}
    			});
    			this.fillPage();
    			this.listener();
    		},

    		fillPage: function () {
    			var i = 0,
    				html = [],
    				orderno = "",
    				length = this.ordernos.length;
    			for (i = 0; i < length; i += 1) {
    				html.push('<p>' + this.ordernos[i] + "</p>");
    			}
    			$('#cashier-orderno').empty().append(html.join(''));
    			html = [];
    			html.push('订单号：');
    			for (i = 0; i < length; i += 1) {
    				html.push('<span>' + this.ordernos[i] + "</span>");
    				orderno += this.ordernos[i] + (i < length - 1 ? "、": "");
    			}
    			$('#cashiser-success-line').html(html.join(''));
    			$('#cashier-amount').html(this.amount);
    			$('#unip-orderno').html(orderno);
    			$('#cashiser-ailPayBtn').attr('href', '/pay/req.htm?payChannel=ALI&itemIds=' + this.itemIds + '&amount=' + this.amount);
                $('#cashiser-onlinePayBtn').attr('href', '/pay/req.htm?payChannel=OPENEPAY&itemIds=' + this.itemIds + '&amount=' + this.amount);
    		},

    		listener: function () {
    			var that = this;
    			$('#cashiser-ailPayBtn').on('click', function () {
    				that.payAction("ailPay");
    			});
                $('#cashiser-onlinePayBtn').on('click', function () {
                    that.payAction("onlinePay");
                });
    		},

    		payAction: function (name){
    			info.show({
					content: name === "ailPay" ? $('#alibox-template').html() : $('#onlinePay-template').html()
				});
				$('#cab-successBtn').on('click', function () {
    				window.location.href = "/app/orderList.html";
    			});
    			$('#cab-failBtn').on("click", function () {
    				info.close();
    			});
    			this.checkPayStatus();
    		},

    		checkPayStatus: function () {
    			var that = this,
    				time = 1800,
    				getStatus = function (){
    					var params = {
    							orderpayid: that.itemIds.split(',')[0]
    						},
    						request = new Ajax('/user/getPayStatus.htm', params);
		    			request.done(function (data) {
		    				if (data.status === "200") {
		    					if (data.re.haveBeenPaid) {
		    						$('#cashiser-success').show();
									$('#cashier').hide();
									$('#cashier-head').hide();
		    					} else {
		    						Cashier.TIMEFLAG = setTimeout(function (){
		    							getStatus();
		    						}, time);
		    						time += 200;
		    					}
		                    } else {
		                        common.errorDialog(data);
		                    }
		    			});	
    				};
    			clearTimeout(Cashier.TIMEFLAG);
    			getStatus();
    				
    		},

    		wxAction: function () {
    			var that = this,
    				params = {
    					payChannel: "WX_NATIVEAPI",
    					itemIds: this.itemIds,
    					amount: this.amount
    				},
    				request = null;
    			if (this.hasCode) {
    				return;
    			}
    			request = new Ajax('/pay/req.htm', params);
    			request.done(function (data) {
    				if (data.status === "200") {
						$('#cashiser-codeImg').attr('src', data.re.imgUrl);
						that.hasCode = true;
						that.checkPayStatus();
                    } else {
                        common.errorDialog(data);
                    }
    			});					
    		}
    	};

    	var cashier = new Cashier();
    });
}(window.requirejs));