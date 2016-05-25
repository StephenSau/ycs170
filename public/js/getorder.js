/**
 * Created by Administrator on 2015/12/29 0029.
 */
/**
 * Created by Administrator on 2015/12/26 0026.
 */
!function(requirejs){
    'use strict';
    requirejs(['jquery','common','info','dialog','formVerified'],function($,common,info,dialog,FormVerified){
        var Getorder = function(){
            this.$updateContent = $("#upadate-opt .update-pwd");
            this.$okContent = $("#update-ok-opt .update-ok");
            this.$okBtn = $(".update-pwd .ok");
            this.$cancelBtn = $(".update-pwd .cancel");
            this.$form = $(".update-pwd form");
            this.needSetPwd = common.getParams("needSetPwd");
            this.mobile = common.getParams("mobile") || '';
            this.username = common.getParams("username") || '';
            this.plainPassword = common.getParams("plainPassword") || '';
            this.$jump = $(".jump i");
            this.countDown = 5;
            this.oTimer = null;
            this.init();
        };

        Getorder.prototype = {
            constructor : Getorder,

            init : function(){
                var that = this;
                this.listener();
                if(this.needSetPwd == 0){
                    this.goToOrder();
                }
            },
            listener : function(){
                var that = this;
                // 判断
                if(this.needSetPwd == 1){
                    this.updateInfo();
                }
                $(document).on("click",".update-pwd .ok",function(){
                    that.updatePwd(this);
                });
                $(document).on("click",".update-pwd .cancel",$.proxy(this.cancel,this));
            },
            updateInfo : function(){
                var that = this,
                    updateContent = this.$updateContent,
                    html =[];

                    html.push('<div class="update-pwd">');
                    html.push('<p class="pwd-head">设置用户名与密码</p>');
                    html.push('<div class="pwd-body">');
                    html.push('<div class="success">');
                    html.push('<p>订单提交成功!  <em>'+this.mobile+'</em>的手机用户，恭喜您成为壹财税用户！</p>');
                    html.push('<p>我们已为您自动生成用户名和密码，为了您的账户安全，请马上修改用户名和密码：</p>');
                    html.push('<div class="info clearfix">');
                    html.push('<span>用户名：<em>'+this.username+'</em></span>');
                    if(this.plainPassword){

                        html.push('<span>密码：<em>'+this.plainPassword+'</em></span>');
                    }
                    html.push('<a href="javascript:void(0);" class="btn ok">修改</a>');
                    html.push('<a href="javascript:void(0);" class="btn cancel">暂不修改</a>');
                    html.push('</div>');
                    html.push('</div>');
                    html.push('<form id="updateForm" name="updateForm">');
                    html.push('<p id="ui-supplement-tips" style="text-align:center;"></p>');
                    html.push('<p><input type="text" class="user" name="user" placeholder="用户名"/></p>');
                    html.push('<p><input type="password" class="pwd" name="pwd" placeholder="密码" /></p>');
                    html.push('<input type="submit" value="确认" class="submit btn" />');
                    html.push('</form>');
                    html.push('</div>');
                    html.push('</div>');


                info.show({
                    content : html.join(""),
                    closeAction : function(){
                        that.goToOrder();
                    }
                });

                /*$('#sf_username').placeholder();
                $('#sf_password').placeholder();*/

                
                $('#updateForm').on('submit', function (event) {
                    event.preventDefault();
                    that.supplementSubmit();
                });
            },
            updatePwd : function(obj){
                var $this = $(obj);
                $this.hide();
                
                $(".update-pwd .cancel").show();
                $(".update-pwd form").slideDown();
            },
            cancel : function(){
                info.close();
                this.goToOrder();
            },
            supplementSubmit : function(){

                /*send form data*/
                var that = this,
                    html =[],
                    okContent = this.$okContent,
                    tips = $('#ui-supplement-tips'),
                    params ={
                    username:$.trim(updateForm.user.value),
                    password:$.trim(updateForm.pwd.value)
                };

                $(updateForm.user).removeClass('invalid');
                $(updateForm.pwd).removeClass('invalid');
                if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(updateForm.user.value)) {
                    tips.html('用户名有误，请输入4-20位字母、数字或“-”、“_”字符').show();
                    $(updateForm.user).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (/^\d+$/.test(updateForm.user.value)) {
                    tips.html('对不起，您输入的用户名不能为纯数字').show();
                    $(updateForm.user).css({
                        'border-color': '#db281f'
                    });
                    return;
                } else if (!/^\S{6,20}$/.test(updateForm.pwd.value)) {
                    tips.html('密码有误，请输入6-20位非空格字符').show();
                    $(updateForm.pwd).css({
                        'border-color': '#db281f'
                    });
                    return;
                }

                
                $.post("/user/setIDAndPwd.htm", params, function (data) {

                    if (data.status === "200") {
                        info.show({
                            content:that.packageSuccessTips()
                        });
                        setTimeout(function(){
                            info.close();
                            that.goToOrder();
                        },2000);
                    } else {
                        tips.html(data.errormsg).show();
                    };
                });
            },

            packageSuccessTips:function(){
                var html = [];
                html.push('<div class="update-ok">');
                html.push('<div class="clearfix update-inner">');
                html.push('<i></i>');
                html.push('<div class="update-detail">');
                html.push('<p>用户名密码修改成功！</p>');
                html.push('<p>2秒后自动关闭</p>');
                html.push('</div>');
                html.push('</div>');
                html.push('</div>');

                return html.join("");
            },
            goToOrder :function(){
                var that = this;

                this.oTimer = setInterval(function(){
                    that.countDown--;

                    if(that.countDown < 1){
                        clearInterval(this.oTimer);
                        window.location.href="/app/orderList.html";
                    }else{

                        that.$jump.html(that.countDown);
                    }
                },1000)
                
            }
        };

        return new Getorder;
    })
}(requirejs)