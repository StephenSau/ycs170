
/**
 * Created by admina on 14-7-22.
 *
 * dialog 对话框，显示文本内容，能给与按钮回调函数
 * ep: var dialog = new Dialog({content: "这是一个对话框"});
 * 入参是一个对象字面量，包括如下字段
 * title｛string|optional|"提示"｝对话框标题，ps：字符串类型，可选，默认值为“提示”，下同
 * content｛string|primary｝对话框内容，
 * width{number|optional|300}对话框宽度，默认是300px，但会根据屏幕宽度调整
 * modal｛boolean|optional|true｝模式，默认显示遮罩层
 * buttons｛array|optional｝指定按钮，是一个对象数组，默认为确定按钮，点击关闭对话框
 * -- name｛string|primary｝， 按钮名称
 * -- callback {function|primary}, 回调函数
 * show方法，入参是对象字面量，字段如构建对话框对象
 * ep：dialog.show({content: "成功"})；
 *
 * close方法，无入参
 * ep：dialog.close();
 */

define(['jquery'], function ($) {
    function Dialog(params) {
        params = params || {};
        this.titleText = params.title || "提示";
        this.contentText = params.content || "";
        this.closeBtn = null;
        this.closeAction = undefined;
        this.width = this.getWidth(params.width);
        this.modal = params.modal !== undefined ? params.modal : true;
        this.buttons = params.buttons;
        this.init();

    }

    Dialog.prototype = {
        cssUrl: "../style/common/dialog.css",
        mask : null,
        box: null,
        fontSize: 16,
        title: null,
        content: null,
        btnGroup: null,

        getWidth: function (width) {
            if (width) {
                return width > window.innerWidth ?  window.innerWidth - 60 : width;
            } else {
                return window.innerWidth < 480 ? window.innerWidth - 60 : 400;
            }
        },

        getHeight : function (contentText, width) {
            contentText = contentText || this.contentText;
            width = width || this.width;
            var fontSize = this.fontSize;
            var lines = Math.ceil((contentText.length * fontSize + fontSize * 2) / width);
            return 22 + fontSize * 1.125 + 10 + lines * fontSize * 1.2 + 24 + 2 + 50;

        },

        init: function () {
            if (this.modal) {
                if (document.getElementById('mask')) {
                    this.mask = $('#mask');
                    this.mask.hide();
                } else {
                    this.mask = $('<div class="mask" id="mask" style="display:none;"></div>').appendTo('body');
                }
            }
            if (!document.getElementById('ui-dialog')) {
                this.initDialog();
            } else {
                this.box = document.getElementById('ui-dialog');
                this.title = document.getElementById('ui-dialog-title');
                this.content = document.getElementById('ui-dialog-content');
                this.btnGroup = document.getElementById('ui-dialog-btnGroup');
            }

        },

        initDialog: function () {
            this.box = document.createElement('div');
            this.box.className = "ui-dialog";
            this.box.id = "ui-dialog";
            this.box.style.width = this.width + "px";
            this.box.style.marginLeft = -this.width / 2 + "px";
            //this.box.style.marginTop = -this.getHeight() / 2 + "px";
            this.box.style.display = "none";
            this.title = document.createElement('h2');
            this.title.className = "ui-title";
            this.title.id = "ui-title";
            this.title.appendChild(document.createTextNode(this.titleText));
            this.box.appendChild(this.title);
            this.content = document.createElement("div");
            this.content.className = "ui-content";
            this.content.id = "ui-content";
            this.content.appendChild(document.createTextNode(this.contentText));
            this.box.appendChild(this.content);
            this.btnGroup = document.createElement("p");
            this.btnGroup.className = "ui-btnGroup";
            this.btnGroup.id = "ui-dialog-btnGroup";
            this.box.appendChild(this.btnGroup);
            this.closeBtn = document.createElement("a");
            this.closeBtn.appendChild(document.createTextNode("×"));
            this.closeBtn.setAttribute('href', 'javascript:;');
            this.closeBtn.className = "ui-closeBtn";
            $(this.closeBtn).click($.proxy(function () {
                this.close();
            }, this));
            this.box.appendChild(this.closeBtn);
            this.rebuildBtnGroup();
            document.body.appendChild(this.box);
        },

        show: function (params) {
            var that = this;
            params = params || {};
            var modal = params.modal !== undefined ? params.modal : this.modal;
            this.closeAction = params.closeAction;
            if (modal) {
                this.mask.show();
                this.mask.unbind('click').on('click', function () {
                    that.close();
                });
            }
            if (params) {
                this.rebuild(params);
            }
            $(this.box).css({
                display: "block"
            });
        },

        rebuild: function (params) {
            var titleText = params.title || this.titleText,
                contentText = params.content || this.contentText,
                width = this.getWidth(params.width);
            if (titleText !== this.titleText) {
                $(this.title).text(titleText);

            }
            if (contentText !== this.contentText) {
                $(this.content).html(contentText);
                this.contentText = contentText;
                this.box.style.width = width + "px";
                this.box.style.marginLeft = (-width / 2) + "px";
                //this.box.style.marginTop = -this.getHeight(contentText, width) / 2 + "px";
            }

            this.rebuildBtnGroup(params.buttons);

        },

        rebuildBtnGroup: function (buttons) {
            buttons = buttons || this.buttons || [];
            var that = this;
            var length = buttons.length;
            $(this.btnGroup).empty();
            if (!length) {
                var confirmBtn = document.createElement("button");
                confirmBtn.setAttribute("type", "button");
                confirmBtn.appendChild(document.createTextNode("确定"));
                $(confirmBtn).click(function () {
                    that.close();
                });
                this.btnGroup.appendChild(confirmBtn);
            } else {
                for (var i = 0; i < length; i++) {
                    var button = document.createElement("button");
                    button.setAttribute("type", "button");
                    button.appendChild(document.createTextNode(buttons[i].name));
                    if(buttons[i].callBack){
                        $(button).click(buttons[i].callBack);
                    }else{
                        $(button).click(function(){
                            that.close();
                        });
                    }
                    this.btnGroup.appendChild(button);
                }
            }
        },

        close : function(callback){
            $(this.box).css({
                display: "none"
            });
            if (this.modal) {
                this.mask.hide();
            }

            if (callback && typeof callback === 'function') {
                this.closeAction = undefined;
                callback();
            }

            if (this.closeAction && typeof this.closeAction === 'function') {
                this.closeAction();
            }
        }
    };
    
    return new Dialog();
});