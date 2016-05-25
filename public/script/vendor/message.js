define(['jquery','formVerified','info','dialog'], function ($,FormVerified,info,dialog) {
	'use strict';

	var Message = function(element,options){
		this.init();
	}

	Message.prototype= {
		init : function(){
			this.create();
		},

		create: function(){
			var html = [],
				that =this;

			html.push('<div class="message-popover">');
			    html.push('<div class="title clearfix">');
			      html.push('<i class="icon"></i>');
			      html.push('<p>感谢您的留言！');
			          html.push('<br />我们将尽快以电话或短信的方式回复您</p>');
			    html.push('</div>');
			    html.push('<p class="tips">');
			     html.push(' 如果您希望我们以微信或者QQ的联系方式联系您，请留下：');
			    html.push('</p>');
			    html.push('<form name="messageForm" id="message-form">');
			      html.push('<p class="input-text">');
			            html.push('<input type="text" name="qq" data-rule="checkQQ:true"  placeholder="您的QQ号" maxLength="20"/>');
			            html.push('<em>或</em>');
			            html.push('<input type="text" name="wx" data-rule="checkWechat:true" placeholder="您的微信号" maxLength="20" />');
			        html.push('</p>');
			        html.push('<p class="input-btn">');
			            html.push('<input type="submit" class="btn" value="确定" />');
			        html.push('</p>');
			    html.push('</form>');
			  html.push('</div>');

			  info.show({
			  	content : html.join(""),
			  });

		},
		show : function(id,cb){
	            var messageVt = new FormVerified(document.getElementById("message-form"), function() {
	            var qq = $.trim($("#message-form [name = 'qq']").val()),
	                wx = $.trim($("#message-form [name = 'wx']").val());

	            $.post("/servicer/editPurpose.htm", {
	                id : id,
	                qq: qq,
	                wechat: wx
	            }, function(data) {
	                if(data.status == 200){
	                    /*清空数据*/

	                    $("[name='qq']").val("");
	                    $("[name='wx']").val("");

	                    info.close();


	                    dialog.show({
                        	content : '提交成功',

                        	buttons:[
                        		{
                        			name : '确定',
                        			callBack: function(){
                        				typeof cb ==="function" && cb();
                        				dialog.close();
                        			}
                        		}
                        	]

	                    })


	                    
	                }
	            })
	        }, false);

	         messageVt.checkQQ = function (value, notRequire) {
	                if (this.checkDirty(value, notRequire)) {
	                    return this.messageInfo.dirty;
	                } else if (!value) {
	                    return "";
	                }
	                if (!/^\d{5,20}$/.test(value)) {
	                    return "请输入正确的QQ号";
	                }
	                return "";
	            };
            messageVt.checkWechat = function (value, notRequire) {
                if (this.checkDirty(value, notRequire)) {
                    return this.messageInfo.dirty;
                } else if (!value) {
                    return "";
                }
                if (/^\s+$/.test(value) || !/^[\s\S]{5,20}$/.test(value)) {
                    return "请输入正确的微信号";
                }
                return "";
            };
		}
	}

	return Message;

})