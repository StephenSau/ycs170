define(['jquery'], function ($) {
    'use strict';
    function FormVerified(form, func, needTips) {
        var that = this;
        this.func = undefined;
        this.needTips = needTips || false;
        this.form  = form;
        this.loadingBox = null;
        this.checkArea = this.findCheckArea();
        if (func !== undefined && typeof func === "function") {
            this.func = func;
        }

        this.checkRange = function (value, min, max, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            
            if (value.length < min || value.length > max) {
                return "请输入" + min + "至" + max + "个字符";
            }
            
            return "";
        };


        this.checkAccount = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }

            if (!/^[A-Za-z0-9\-\_]{4,20}$/.test(value)) {
                return "请输入4-20位字母、数字或“-”、“_”字符";
            }
            return "";
        };

        this.checkLength = function (value, length, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (value.length !== length * 1) {
                if (notRequire !== undefined && notRequire !== "true") {
                    return notRequire;
                }
                return this.messageInfo.lengthError + length + "个字符";
            }
            return "";
        };

        this.checkCNName = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (!/^[\u4E00-\u9FBF]{2,8}$/.test(value)) {
                return this.messageInfo.nameError;
            }
            return "";
        };

        this.checkName = function (value, min, max, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            var reg = new RegExp('^[\\u4E00-\\u9FBFA-Za-z]{' + min + ',' + max + '}$');

            if (/^\s+$/.test(value) || !reg.test(value)) {
                return '请输入' + min + '-' + max + '位中英文字符';
            }
            return "";
        };



        this.checkTelphone = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(value)) {
                return this.messageInfo.phoneError;
            }
            return "";
        };
        
        this.checkPhone = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (!/^(\d{0,4}-)?\d{8}$/.test(value)) {
                return "请输入正确的座机号(如020-38383838)";
            }
            return "";
        };

        this.checkCode = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (!/^\d{6}$/.test(value)) {
                return this.messageInfo.codeError;
            }
            return "";
        };

        this.checkId = function (value, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if (!/^(\d{6})(18|19|20)?(\d{2})([01]\d)([0123]\d)(\d{3})(\d|X)?$/.test(value)) {
                return this.messageInfo.idError;
            } else {
                var length = value.length;
                if (length === 18) {
                    var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2],
                        arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'],
                        total = 0;
                    for (var i = 0; i < 17; i++) {
                        total += parseInt(value.substr(i, 1),10) * arrInt[i];
                    }
                    if(value.substr(17, 1) !== arrCh[total % 11]){
                        return this.messageInfo.idError;
                    }
                }
            }
            return "";
        };

        this.checkMoney = function(value, notRequire){
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            var reg = /(^[1-9]\d*(\.\d{1,2})?$)|(^0\.\d{1,2}$)/;
            if(!reg.test(value)){
                return this.messageInfo.moneyError;
            }
            return "";
        };

        this.checkNumber = function(value, length, notRequire){
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            var reg = new RegExp('^\\d{' + length + '}$');
            if (!reg.test(value)) {
                return this.messageInfo.numberError;
            }
            return "";
        };

        this.checkWords = function (value, min, max, notRequire) {
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            var reg = new RegExp('^[\\u4E00-\\u9FBFA-Za-z0-9 ]{' + min + ',' + max + '}$');

            if (/^\s+$/.test(value) || !reg.test(value)) {
                return '请输入' + min + '-' + max + '位中英文数字字符';
            }
            return "";
        };

        this.checkDate = function(value, format, notRequire){
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            var reg = /^[12]\d{3}-(1[0-2]|0[1-9])-([0][1-9]|[12]\d|3[0-1])$/;
            if(format && format !== "true"){
                var regStr = format.replace(/(yy|yyyy|MM|dd|hh|mm|ss)/, function(match, pos, originalText){
                    switch(match){
                        case "yy":
                            return "\d{2}";
                        case "yyyy":
                            return "[12]\d{3}";
                        case "MM":
                            return "(1[0-2]|0\d)";
                        case "dd":
                            return "(3[0-1]|[0-2]\d)";
                        case "hh":
                            return "(2[0-4]|[0-1]\d)";
                        case "mm":
                            return "[0-5]\d";
                        case "ss":
                            return "[0-5]\d";
                    }
                });
                reg = new RegExp("^" + regStr + "$");
            }
            if(!reg.test(value)){
                return this.messageInfo.dateError;
            }
            return "";
        };

        this.checkEmail = function(value, notRequire){
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            if(!/^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/.test(value)){
                return this.messageInfo.emailError;
            }
            return "";
        };

        this.checkEmpty = function(value, errorMessage){
            if(value === ""){
                return errorMessage ? errorMessage : this.messageInfo.emptyError;
            }
            return "";
        };

        this.checkLicensePlateNo = function(value, length){
            var regs = {
                    "7": /^[\u4E00-\u9FBF][A-Za-z][A-Za-z0-9]{4}[A-Za-z0-9港澳挂]$/,
                    "6": /^[A-Za-z][A-Za-z0-9]{4}[A-Za-z0-9港澳挂]$/,
                    "5": /^[A-Za-z0-9]{4}[A-Za-z0-9港澳挂]$/
                },
                reg = regs[length],
                maxLength = length === "5" ? 2 : 3,
                result = false;
            if(!reg.test(value)){
                result = false;
            }else{
                if(!value.match(/[A-Za-z]/g) || value.match(/[A-Za-z]/g).length <= maxLength){
                    result = true;
                }
            }
            return  result ? "" : this.messageInfo.licensePlateNoError;
        };

        this.checkConfirm = function(value, target, notRequire){
            var i = 0,
                values = [],
                targetNode = null;
            if (this.checkDirty(value, notRequire)) {
                return this.messageInfo.dirty;
            } else if (!value) {
                return "";
            }
            for (i = 0; i < this.checkArea.length; i++) {
                if (this.checkArea[i].type === "password") {
                    values.push(this.checkArea[i].value);
                }
            }
            
            if (values.length === 2) {
                if (values[1] === "") {
                    return this.messageInfo.passwordError;
                }
                return values[1] === values[0] ? "": this.messageInfo.passwordError;
            } else if (target) {
                if (value === ""){
                    return this.messageInfo.passwordError;
                }
                return value === document.getElementById(target).value ? "": this.messageInfo.passwordError;
            }
        };

        this.submitForm = function(event){
            event.preventDefault();
            if(!this.checkValidity()){
                event.preventDefault();
            }else{
                if(this.func !== undefined){
                    event.preventDefault();
                    this.func("this.loadingBox");
                }
            }
        };


        $(this.form).submit(function(event){
            that.submitForm(event);
        });

    }

    FormVerified.prototype = {

        messageInfo:{
            dirty: "此为必填项",
            licensePlateNoError: "请输入正确的车牌号码",
            lengthError: "输入信息不满",
            moneyError: "请输入价钱",
            numberError: "请输入数值",
            emptyError: "请填写或选择",
            nameError: "请填写2~8个中文名",
            phoneError: "请填写正确的手机号码",
            idError:"请填写正确的身份证",
            codeError: "请填写正确邮寄编码",
            dateError: "请输入正确的日期",
            emailError: "请填写正确的电子邮箱",
            passwordError: "密码不一致请重新输入"
        },

        checkDirty: function (value, notRequire) {
            var isRequire = notRequire === "true" ? false : true;
            if (!isRequire) {
                return false;
            } else if (isRequire && value === ""){
                return true;
            }
        },

        findCheckArea: function(){
            var elements = this.form.elements,
                result = [];
            for(var i = 0, length = elements.length; i < length; i++){
                if(elements[i].getAttribute('data-rule')){
                    result.push(elements[i]);
                }
            }
            return result;
        },



        checkValidity: function(){
            var i = 0,
                that = this,
                length = this.checkArea.length,
                area = null,
                value = "",
                name = "",
                result = "",
                localChange = function () {
                                that.addWatch(this);
                            },
                canPass = true;
            for(i = 0; i < length; i++){
                area = this.checkArea[i];
                value = "";
                var rules = [];
                var params = [];
                if (area.getAttribute('data-rule')) {
                    result = this.getResult(area);
                    
                    if ( area.tagName.toUpperCase() === "SELECT" ||
                            area.tagName.toUpperCase() === "INPUT" && 
                            (area.type === "checkbox" || area.type === "radio")) {
                        $(area).unbind('change', localChange).bind('change', localChange);
                    } else if ((area.tagName.toUpperCase() === "INPUT" || area.tagName.toUpperCase() === "TEXTAREA") &&
                               area.type !== "checkbox" &&
                               area.type !== "radio") {
                        $(area).unbind('keyup', localChange).bind('keyup', localChange);
                    }
                    if (result !== "") {
                        this.changeStatus(area, 'invalid', result);
                        canPass = false;
                    } else {
                        this.changeStatus(area, 'valid');
                    }
                }
            }
            return canPass;
        },

        changeStatus: function (area, status, message) {
            var id = '',
                error = null;
            if (area.type !== "checkbox" && area.type !== "radio" ){
                $(area).removeClass('valid invalid').addClass(status);
                if (area.tagName.toUpperCase() !== "SELECT" && this.needTips) {
                    id = area.getAttribute('data-error-target');
                    error = null;
                    if (!id) {
                        id = 'e' + parseInt(Math.random()*1e16, 10);
                        area.setAttribute('data-error-target', id);
                    }
                    if (!document.getElementById(id)) {
                        error = $('<span class="error" id="' + id + '" style="display:none;"></span>');
                        $(area).parent().append(error);
                    } else {
                        error = $('#' + id);
                    }
                    if (status === 'invalid' && message) {
                        error.html(message).show();
                    } else if (status === "valid"){
                        error.hide();
                    }
                }
            } else {
                $(area).parent('.form-choice-group').removeClass('valid invalid').addClass(status);
            }
            if (area.tagName.toUpperCase() === "SELECT") {
                $(area).trigger('chosen:change');
            }
        },
        
        
        getResult: function (area) {
            var i = 0,
                length = 0,
                rules = [],
                params = [],
                checked = null,
                checkeds = null,
                value = "",
                result = "";
            rules = area.getAttribute('data-rule').split(":");
            if (area.type === "checkbox") {
                name = area.getAttribute('name');
                checkeds = $('input:checkbox[name=' + name+ ']:checked');
                if (checkeds.length) {
                    for(i = 0, length = checkeds.length; i < length; i++){
                        value = value + checkeds[i].value + (i === length - 1 ? "" : ',');
                    }
                } else {
                    value = "";
                }

            } else if (area.type === "radio") {
                name = area.getAttribute('name');
                checked = $('input:radio[name=' + name+ ']:checked');

                if(checked.length){
                    value = checked.val();
                }else{
                    value = "";
                }
            } else {
                value = area.value;
            }
            params = rules[1] ? params.concat(value, rules[1].split(",")) : [value];
            result = this[rules[0]].apply(this, params);
            return result;
        },
        
        addWatch: function (area) {
            var rules = [],
                i = 0,
                length = 0,
                params = [],
                value = "",
                result = "";
            if (area.getAttribute('data-rule')) {
                result = this.getResult(area);
                if (result !== "") {
                    this.changeStatus(area, 'invalid', result);
                } else {
                    this.changeStatus(area, 'valid');
                }
            }
        }
    };
    
    return FormVerified;
});