define(["jquery","formVerified","info","dialog"],function(e,t,s,n){"use strict";var i=function(e,t){this.init()};return i.prototype={init:function(){this.create()},create:function(){var e=[];e.push('<div class="message-popover">'),e.push('<div class="title clearfix">'),e.push('<i class="icon"></i>'),e.push("<p>感谢您的留言！"),e.push("<br />我们将尽快以电话或短信的方式回复您</p>"),e.push("</div>"),e.push('<p class="tips">'),e.push(" 如果您希望我们以微信或者QQ的联系方式联系您，请留下："),e.push("</p>"),e.push('<form name="messageForm" id="message-form">'),e.push('<p class="input-text">'),e.push('<input type="text" name="qq" data-rule="checkQQ:true"  placeholder="您的QQ号" maxLength="20"/>'),e.push("<em>或</em>"),e.push('<input type="text" name="wx" data-rule="checkWechat:true" placeholder="您的微信号" maxLength="20" />'),e.push("</p>"),e.push('<p class="input-btn">'),e.push('<input type="submit" class="btn" value="确定" />'),e.push("</p>"),e.push("</form>"),e.push("</div>"),s.show({content:e.join("")})},show:function(i,u){var a=new t(document.getElementById("message-form"),function(){var t=e.trim(e("#message-form [name = 'qq']").val()),a=e.trim(e("#message-form [name = 'wx']").val());e.post("/servicer/editPurpose.htm",{id:i,qq:t,wechat:a},function(t){200==t.status&&(e("[name='qq']").val(""),e("[name='wx']").val(""),s.close(),n.show({content:"提交成功",buttons:[{name:"确定",callBack:function(){"function"==typeof u&&u(),n.close()}}]}))})},!1);a.checkQQ=function(e,t){return this.checkDirty(e,t)?this.messageInfo.dirty:e?/^\d{5,20}$/.test(e)?"":"请输入正确的QQ号":""},a.checkWechat=function(e,t){return this.checkDirty(e,t)?this.messageInfo.dirty:e&&(/^\s+$/.test(e)||!/^[\s\S]{5,20}$/.test(e))?"请输入正确的微信号":""}}},i});