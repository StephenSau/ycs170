/**
 * Created by Administrator on 2015/12/7 0007.
 */
/*
* shopstart maniplate
* */
(function(requirejs){
    requirejs(['jquery', 'ajax', 'dialog', 'formVerified', 'addrsCtrl', 'chosen', 'choice'],function($, Ajax, Dialog,FormVerified, addrsCtrl, chosen, choice){

        var shopStart = function(){
            /*初始化弹出框*/
            this.dialog = Dialog;
            this.init();
        }

        /*servicer here start*/
        shopStart.prototype = {
            constructor : shopStart,
            init : function(){
                var that = this;

                new FormVerified(document.getElementById("form"),function(){
                    that.formPost();
                },true);

                $("select").chosen();

                $('input[type="checkbox"]').choice();

                this.selectAction();
            },

            /*post ajax data*/
            formPost : function(){
                var that = this;
                var aChkbox = ($(":checkbox:checked"));
                var buzArr = [];
                $.each(aChkbox,function(){
                    buzArr.push(this.value);
                })

                /*send form data*/
                var params ={
                    name:$.trim(form.name.value),
                    title:$.trim(form.title.value),
                    mobile:$.trim(form.mobile.value),
                    company:$.trim(form.company.value),
                    province:$.trim(form.province.value),
                    city:$.trim(form.city.value),
                    address:$.trim(form.address.value),
                    fields:buzArr.join(',')
                }

                var request = new Ajax('/servicer/shopStart.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.dialog.show({
                            content: "您的预约已提交，我们的商务人员会尽快联系您，谢谢！",
                            closeAction : function(){
                                that.formReset();
                            }
                        });
                    } else {
                        that.dialog.show({
                            content: data.errormsg
                        });
                    };
                });
            },

            formReset : function(){
                    form.name.value="";
                    form.mobile.value="";
                    form.company.value="";
                    form.address.value="";

                    $("[name='title']").val("女士");
                    $("select").chosen();
                    this.addressInit();

            },

            selectAction: function () {
               this.addressInit();
                $('#province').change(function () {
                    addrsCtrl.addressSelectAction({
                        selectObj: document.getElementById('city'),
                        value: this.value,
                        isCity: true
                    });
                });
            },

            addressInit : function(){
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('province'), selected: "440000"});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('city'), value: "440000", selected: "440100", isCity: true});
            }

        }

        var shopstart = new shopStart();
    })
})(requirejs)