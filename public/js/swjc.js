(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common', 'info'], function ($, common, info) {
    	function LandingConsult(){
			this.$element =$(".consultBtn");
			this.init();
			this.addConsultBtn();
		}


		LandingConsult.prototype ={

			constructor : LandingConsult,

			init : function(){

			},

			 telphoneReg: /(^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$)|(^(\d{0,4}\-)?\d{8}$)/,

			 addConsultBtn : function(){
                var that = this;
                this.$element
                    .on('click', function () {
                        info.close();
                        that.showConsultBox();
                    });
            },

            showConsultBox : function(){
                var that = this,
                    phoneText = null,
                    html = [];

                html.push('<div class="phone_box" id="dial_box">');
                html.push('<div class="mb_btnline">');
                html.push('<p>请留下您的电话，壹财税专家将尽快与您联系</p>');
                html.push('<input type="tel" class="mb_text" name="phone" id="dial_phone" placeholder="请输入您的手机或固话号码" maxlength="15">');
                html.push('<a href="javascript:;" id="dial_btn" class="btn btn-warning">确定</a>');
                html.push("</div>");
                html.push('</div>');
                info.show({
                    content: html.join('')
                });

                phoneText = $('#dial_phone');

                phoneText.placeholder().on('keyup', function (event) {
                var code = event.keyCode;
                if (!that.telphoneReg.test(this.value)) {
                    phoneText.addClass('invalid');
                    phoneText.removeClass('valid');
                } else {
                    phoneText.addClass('valid');
                    phoneText.removeClass('invalid');
                    if (code === 13) {
                        info.close();
                        that.consultPhone(phoneText.val());
                    }
                }
            })

                $('#dial_btn').on('click', function () {
                    if (!that.telphoneReg.test(phoneText.val())) {
                        phoneText.addClass('invalid');
                    } else {
                        info.close();
                        that.consultPhone(phoneText.val());
                    }
                    
                });

            },

            consultPhone : function(phoneNo){
                var that = this ;
                var params = {
                    phoneNo : phoneNo
                };
                $.ajax({
                    type : "POST",
                    url : '/mwx/sendMsg4TaxCrisis.htm',
                    dataType : "json",
                    data : params,
                    xhrFields: {
                        withCredentials: true
                    }
                }).done(function(data){
                    if(data.status === "200"){
                        that.showOkBox();
                    }
                }).fail(function(data){
                    alert("系统繁忙中");
                });

            },

            showOkBox: function () {
                var html = [];
                html.push('<div class="ok_box">');
                html.push('<i class="icon"></i> ');
                html.push('<p>提交成功</p>');
                html.push('</div>');
                info.show({
                    content: html.join('')
                });

                setTimeout(function(){
                    info.close();
                },2000)
            }
            
		}

		var landingConsult = new LandingConsult();
    });
}(window.requirejs));