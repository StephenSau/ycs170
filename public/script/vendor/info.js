define(['jquery'], function ($) {
    'use strict';
    function Info(params) {
        params = params || {};
        this.contentText = params.content || "";
        this.width = params.width || 0;
        this.closeAction = undefined;
        this.modal = params.modal !== undefined ? params.modal : true;
        this.init();
    }
    
    Info.prototype = {
        mask: null,
        box: null,
        content: null,
        inner: null,
        closeBtn: null,
        init: function () {
            if (this.modal) {
                if (document.getElementById('mask')) {
                    this.mask = $('#mask');
                    this.mask.hide();
                } else {
                    this.mask = $('<div class="mask" id="mask" style="display:none;"></div>').appendTo('body');
                }
            }
            
            if (!document.getElementById('ui-info')) {
                this.initInfo();
            } else {
                this.box = $('#ui-info');
                this.content = $('#ui-info-content');
                this.closeBtn = $('ui-info-close');
                this.content.html(this.contentText);
            }
            
            
            this.closeBtn.unbind('click').bind('click', $.proxy(function () {
                this.close();
            }, this));
            
            
        },
        
        close: function (callback) {
            this.mask.hide();
            $('html').removeAttr('style');
            this.box.hide().removeClass('in');

            if (callback && typeof callback === 'function') {
                this.closeAction = undefined;
                callback();
            }

            if (this.closeAction && typeof this.closeAction === 'function') {
                this.closeAction();
            }
        },
        
        
        initInfo: function () {
            this.box = $('<div class="ui-info" id="ui-info" style="display:none;"></div>');
            this.inner = $('<div class="ui-info-inner modal"></div>');
            this.content = $('<div class="ui-info-content" id="ui-info-content">');
            this.content.html(this.contentText);
            this.closeBtn = $('<a href="javascript:;" class="ui-info-close" id="ui-info-close">×</a>');
            this.inner.append(this.content).append(this.closeBtn);
            this.box.append(this.inner).appendTo('body');
        },
        
        show: function (params) {
            params = params || {};
            var that =this;
            var modal = params.modal !== undefined ? params.modal : this.modal;
            this.closeAction = params.closeAction;
            if (modal) {
                $(this.mask).show();
                $(this.mask).unbind('click').on('click', function () {
                    that.close();
                });
            }    
            if (params) {
                this.rebuild(params);
            }
            
            $(this.box).addClass('in').show();
        },
        
        rebuild: function (params) {
            var contentText = params.content || this.contentText,
                width = 0;
            if (typeof contentText === "string") {
                this.content.html(contentText);
            } else if (typeof contentText === "object") {
                this.content.append(contentText);
            }
            this.content.html(contentText);
            if (params.width) {
                width = params.width + 30;
            } else {
                width = this.box.width();
            }
            
            this.box.css({
                'margin-left': '-' + width / 2 + "px"
            });
        }
    };
    return new Info();
});