(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common', 'info', 'dial'], function ($, common, info, dial) {
    	function Search () {
    		this.init();
    	}

    	Search.prototype = {
    		init: function () {
                $('#hwsb-text').val(decodeURI(common.getParams('querycondition')));
                $('#hwsb-hotSearch').hide();
    			this.listener();
    		},

    		listener: function () {
    			$('#search-aside').on('click', 'a[data-role="collapse"]', function (){
    				var btn = $(this),
    					target= btn.attr('data-target');
    				if (btn.hasClass('active')) {
    					btn.html("展开").removeClass('active');
    					$('#' + target).removeClass('active');
    				} else {
    					btn.html("收起").addClass('active');
    					$('#' + target).addClass('active');
    				}
    			});
    		}
    	};

    	var search = new Search();
    });
}(window.requirejs));