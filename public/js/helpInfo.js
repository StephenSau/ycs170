(function (requirejs) {
    'use strict';
    requirejs(['jquery', 'common', 'ajax', 'dialog'], function ($, common, Ajax, dialog) {
    	function HelpDetail () {
    		this.init();
    	}

    	HelpDetail.prototype = {
    		init: function () {
    			var that = this;
    			$('#help-feedback-useful').click(function () {
    				that.submitAdvice('useful', this.getAttribute('data-value'));
    			});
    			$('#help-feedback-useless').click(function () {
    				that.submitAdvice('useless', this.getAttribute('data-value'));
    			});
    		},
    		submitAdvice: function (status, id) {
    			var that = this,
                    params = {
                    	helpId: id,
                    	useful: status === "useful" ? 1 : 0,
                    	useless: status === "useless" ? 1 : 0
                    },
                    request = new Ajax ('/help/handleUseful.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        dialog.show({
                            content: "提交成功"
                        });
                        if (status === "useful") {
                            $('#help-feedback-useful').html($('#help-feedback-useful').html()*1 + 1);
                        } else {
                            $('#help-feedback-useless').html($('#help-feedback-useless').html()*1 + 1);
                        }
                    } else {
                        common.errorDialog(data);
                    }
                });
    		}
    	};
    	var helpDetail = new HelpDetail();
    });
}(window.requirejs));