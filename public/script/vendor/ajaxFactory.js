(function (define) {
	"use strict";
	define(['jquery'], function ($) {
		function Ajax(url, params){
			return $.ajax({
				url: url,
				data: params ? params : "",
				dataType: "json",
				type: "POST",
				xhrFields: {
					widthCredentials:true
				}
			});
		}

		return Ajax;
	});
}(window.define));