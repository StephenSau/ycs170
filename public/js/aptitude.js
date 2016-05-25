(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common', 'info'], function ($, common, info) {
    	function Aptitude () {
    		this.init();
    	}

    	Aptitude.prototype = {
    		init: function () {
    			var that = this;
    			$('#aptitude-list').on('click', 'img', function () {
    				that.showImgBox(this);
    			});
    		},

    		showImgBox: function (obj) {
    			var that = this,
    				html = [];
    			html.push('<div class="aptitude-imgBox">');
    			html.push('<img src="' + $(obj).attr('data-src') + '" />');
    			html.push('</div>');
    			info.show({
    				content: html.join("")
    			});
    		}
    	};
    	var aptitude = new Aptitude();
    });
}(window.requirejs));