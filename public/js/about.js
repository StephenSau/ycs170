(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common'], function ($, common) {
        var index = 0;
        setInterval(function () {
        	if (index === 0) {
        		$('#bigBanner-col01').fadeOut(2000);
        		$('#bigBanner-col02').fadeIn(2000);
        	} else if (index === 1) {
        		$('#bigBanner-col02').fadeOut(2000);
        		$('#bigBanner-col03').fadeIn(2000);
        	} else if (index === 2) {
        		$('#bigBanner-col03').fadeOut(2000);
        		$('#bigBanner-col01').fadeIn(2000);
        	}
        	index = (index + 1)%3;
        }, 5000);
    });
}(window.requirejs));