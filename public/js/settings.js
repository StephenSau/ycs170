(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'ajax', 'common', 'dialog', 'info', 'formVerified', 'addrsCtrl', 'handlebars', 'industry', 'chosen', 'tab', 'choice'], function ($, Ajax, common, dialog, info, FormVerified, addrsCtrl, Handlebars) {
        function Settings () {
            this.timeFlag = null;
            this.countDownBtn = null;
            this.onCountDown = false;
            this.contactsData = [];
            this.contactsStatus = "modify";
            this.contactsId = "";
            this.companyStatus = "modify";
            this.companyId = "";
            this.accesskey = "";
            this.init();
        }

        Settings.TIMEFLAG = null;
        Settings.BINDTIMEFLAG = null;

        Settings.prototype = {
            init: function () {
                this.fillIndustry();
                this.fillUserInfo();
                $('select').chosen();
                $('#sbca-tab').tab();
                $('input:checkbox').choice();
                this.listener();
                this.formAction();
                this.selectAction();
                this.queryContacts();
            },

            fillIndustry: function () {
                var that = this,
                    i = 0,
                    j = 0,
                    item = null,
                    iLen = 0,
                    jLen = 0,
                    html = [];
                html.push('<option value="-1">请选择</option>');
                for(i = 0, iLen = ycs_sys_industry_category.length; i < iLen; i += 1) {
                    html.push('<optgroup label="' + ycs_sys_industry_category[i].name + '">');
                    for (j = 0, jLen = ycs_sys_industry_category[i].sub.length; j < jLen; j += 1) {
                        item = ycs_sys_industry_category[i].sub[j];
                        html.push('<option value="' + item.id + '">' + item.name + '</option>');
                    }
                    html.push('</optgroup>');
                }
                $('#sbcac-industry').empty().append(html.join(''));
            },



            fillUserInfo: function () {
                var that = this,
                    icode = $.cookie('code'),
                    istate = $.cookie('state'),
                    code = common.getParams('code'),
                    state = common.getParams('state');
                function query() {
                    var phoneBtn = $('#sbcpt-phoneBtn');
                    if (common.userInfo){
                        $('[data-role="username"]').html(common.userInfo.username);
                        if (common.userInfo.nickname) {
                            $('#sbca-nickNameForm').removeClass('active');
                            $('#sbca-form-tab').addClass('active');
                            $('#sbca-nickNameText').html(common.userInfo.nickname);
                            $('#sbca-nickNameInput').val(common.userInfo.nickname);
                        } else {
                            $('#sbca-nickNameForm').addClass('active');
                            $('#sbca-form-tab').removeClass('active');
                        }
                        if (common.userInfo.updateflag === "0"){
                            $('a[data-role="modifyUsername"]').show();
                        }
                        if (common.userInfo.mobile !== "") {
                            $('#sbcp-tab li').removeClass('active');
                            phoneBtn.addClass('active');
                            $('[data-role="mobile"]').html(common.userInfo.mobile);
                            $('#sbc-phone-header').removeClass('sbc-unbind').addClass('sbc-binded');
                            $('#sbb-steps-box-1').hide();
                            $('#sbb-tips').show();
                            $('#sbb-phone-form').addClass('active');
                            $('#sbce-tab').addClass('active');
                            $('#sbc-tab').addClass('active');
                            $('#sbcet-phoneBtn').addClass('active');
                            $('#sbcpt-passwordBtn').hide();
                            
                        } else{
                            phoneBtn.hide();
                            $('#sbb-steps-box-2').hide();
                            $('#sbc-tab').removeClass('active');
                            $('#sbce-info-box').addClass('active');
                            $('#sbb-bindMobile-form').addClass('active');
                        }

                        if (common.userInfo.email !== "") {
                            $('#sbcet-phoneBtn').removeClass('active');
                            $('#sbcet-emailBtn').addClass('active');
                            $('#sbc-email-header').removeClass('sbc-unbind').addClass('sbc-binded');
                            $('[data-role="email"]').html(common.userInfo.email);
                            $('#sbce-steps-text').html("修改绑定邮箱");
                            $('#sbcpt-passwordBtn').hide();
                        } else{
                            $('#sbcet-emailBtn').hide();
                            $('#sbce-steps-text').html("绑定邮箱");
                            $('#sbcpt-emailBtn').hide();
                        }

                        $('[data-role="username"]').html(common.userInfo.username);

                        if (common.userInfo.mobile === "" && common.userInfo.email === "") {
                            $('#sbcpt-passwordBtn').show().addClass('active');
                        }
                        $('#sbce-tab').tab({
                            callback: function (obj) {
                                that.resetForm($('#' + obj.attr('data-target')));
                                $('#' + obj.attr('data-target')).find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                            }
                        });
                        $('#sbcp-tab').tab({
                            callback: function (obj) {
                                that.resetForm($('#' + obj.attr('data-target')));
                                $('#' + obj.attr('data-target')).find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                            }
                        });


                        that.resetSwitchBtn();
                        that.checkBinded('wx', false);
                        that.checkBinded('qq', false);
                        setTimeout(function () {
                            if (code && state &&
                                (!(icode || istate) ||
                                (icode && istate && (icode !== code || istate !== state)))) {
                                that.wxBind(common.getParams('code'), common.getParams('state'));
                            }
                        }, 100);
                    } else{
                        setTimeout(query, 50);
                    }
                }
                query();
            },

            checkBinded: function (target, flag) {
                var that = this,
                    count = 0,
                    btn = $('#sbc-' + target + '-btn'),
                    header = $('#sbc-' + target + '-header'),
                    tips = $('#sbc-' + target + '-tips'),
                    box = $('#sbc-' + target + '-box'),
                    url = target === "wx" ? "/user/checkMyWechatBindFinished.htm": "/user/checkMyQQBindFinished.htm",
                    source = $('#binging_success_template').html(),
                    template = Handlebars.compile(source),
                    html = template({});
                function query (repeatFlag) {
                    var request = new Ajax(url);
                    request.done(function (data) {
                        if (data.status === "200") {
                            if (data.re.bind) {
                                btn.text("解绑")
                                    .attr('data-collapse-text', "解绑")
                                    .attr('data-expand-text', "解绑")
                                    .unbind('click')
                                    .on('click', function () {
                                        that.boxSwitch(this);
                                    });
                                header.removeClass('sbc-unbind').addClass('sbc-binded');
                                tips.text('已绑定');
                                box.removeClass('active');
                                if (repeatFlag){
                                    if (target === "wx") {
                                        clearTimeout(Settings.BINDTIMEFLAG);
                                        info.show({
                                            content: html
                                        });
                                    } else if (target === "qq") {
                                        clearTimeout(Settings.BINDTIMEFLAG);
                                    }
                                    
                                }
                            } else {
                                btn.text("绑定")
                                    .attr('data-collapse-text', "绑定")
                                    .attr('data-expand-text', "绑定")
                                    .unbind('click')
                                    .on('click', function () {
                                        that.bindAction(target);
                                    });
                                header.removeClass('sbc-binded').addClass('sbc-unbind');
                                tips.text('');
                                box.removeClass('active');
                                if (repeatFlag) {
                                    Settings.BINDTIMEFLAG = setTimeout(function () {
                                        count = count + 1;
                                        if (count > 20) {
                                            clearTimeout(Settings.BINDTIMEFLAG);
                                        } else {
                                            query(repeatFlag);
                                        }
                                    }, 1000);
                                }
                            }
                        } else {
                            common.errorDialog(data);
                        }
                    });
                }
                query(flag);
            },

            bindAction: function (target) {
                if (target === "wx") {
                    this.showWXBind();
                } else {
                    this.showQQBind();
                }
                clearTimeout(Settings.BINDTIMEFLAG);
                this.checkBinded(target, true);
            },

            unbindAction: function (target) {
                var that = this,
                    btn = $('#sbc-' + target + '-btn'),
                    header = $('#sbc-' + target + '-header'),
                    tips = $('#sbc-' + target + '-tips'),
                    box = $('#sbc-' + target + '-box'),
                    url = target === "wx" ? "/user/removeWechatBind.htm": "/user/removeMyQQBind.htm",
                    request = new Ajax(url),
                    source = $('#unbind_success_template').html(),
                    template = Handlebars.compile(source),
                    html = template({});
                request.done(function (data) {
                    if (data.status === "200") {
                        btn.text("绑定").attr('data-collapse-text', "绑定").unbind('click').on('click', function () {
                            that.bindAction(target);
                        });
                        header.removeClass('sbc-binded').addClass('sbc-unbind');
                        tips.text('');
                        box.removeClass('active');
                        info.show({
                            content: html
                        });
                    } else {
                        common.errorDialog(data);
                    }
                });
            },


            showWXBind: function () {
                var obj = null,
                    source = $('#wxBindBox-template').html(),
                    template = Handlebars.compile(source),
                    html = template({});
                info.show({
                    content: html
                });
                obj = new WxLogin({
                    id: "wxBindBox",
                    appid: "wx3d09fbc212f8fa1e",
                    scope: "snsapi_login",
                    redirect_uri: "http://www.1caishui.com/app/settings.html",
                    state: "THIRD_PARTY_1CAISHUI_WEIXIN_LOGIN",
                    style: "black",
                    href: ""
                });
            },

            wxBind: function (code, state) {
                var that = this,
                    params = {
                        code: code,
                        state: state
                    },
                    request = new Ajax('/user/wechatBind.htm', params);
                $.cookie('code', code, {expires: 1, path: '/'});
                $.cookie('state', state, {expires: 1, path: '/'});
                request.done(function (data) {
                    if (data.status === "200") {
                        clearTimeout(Settings.BINDTIMEFLAG);
                        that.checkBinded('wx', true);
                    } else {
                        clearTimeout(Settings.BINDTIMEFLAG);
                        common.errorDialog(data);
                    }
                });
            },

            showQQBind: function () {
                window.open('http://www.1caishui.com/user/bindQQ.htm', 'newwindow','height=430,width=700,top=200,left=200,toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no');
            },


            listener: function () {
                var that = this;
                $('a[data-role="modifyUsername"]').on('click', function () {
                    $('#sbca-nickNameForm').removeClass('active');
                    $('#sbca-form-tab').removeClass('active');
                    $('#sbca-userNameform').addClass('active');
                });
                $('#sbca-MNNBtn').on('click', function () {
                    $('#sbca-form-tab').removeClass('active');
                    $('#sbca-nickNameForm').addClass('active');
                    $('#sbca-nickNameInput').val(common.userInfo.nickname);
                });
                
                $('[data-role="imageCode"]').on('click', 'img', function () {
                    $(this).attr('src', '/vc.htm?v=' + new Date().getTime());
                }).on('click', 'a', function () {
                    $(this).siblings('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                });

                $('a[data-role="codeBtn"]').on('click', function () {
                    var id = this.id;
                    if (!that.checkCountDown($(this))) {
                        if (id === "sbcp-getPhoneCode") {
                            that.getPhoneCode('passwordPhoneForm', $(this));
                        } else if (id === "sbb-getPhoneCode") {
                            that.getPhoneCode('checkPhoneForm', $(this));
                        } else if (id === "ssb-getBindCode") {
                            that.getPhoneCode('bindMobile', $(this));
                        } else if (id === "ssb-getReBindCode") {
                            that.getPhoneCode('rebindMobile', $(this));
                        } else if (id === "seb-getPhoneCode") {
                            that.getPhoneCode("checkIdByPhoneInEmail", $(this));
                        } else if (id === "seb-getBindCode") {
                            that.getCodeIE(true);
                        } else if (id === "seb-getEmailCode") {
                            that.getEmailCode("checkIdByEmailInEmail", true);
                        } else if (id === "seb-getEmailCodeIP") {
                            that.getEmailCode("checkIdByEmailIP", true);
                        }
                    }
                });

                $('a[data-role="switch"]').on('click', function () {
                    that.boxSwitch(this);
                });

                $('#sbc-wx-unbind-btn').on('click', function () {
                    that.unbindAction("wx");
                });

                $('#sbc-qq-unbind-btn').on('click', function () {
                    that.unbindAction("qq");
                });

                $('#sbca-contactors-list').on('click', 'a[data-role="delCom"]', function () {
                    that.showMessageBox({
                        id: this.getAttribute('data-value')
                    }, 'delCom');
                }).on('click', 'a[data-role="delComNC"]', function () {
                    that.showMessageBox({
                        id: this.getAttribute('data-value')
                    }, 'delComNC');
                }).on('click', 'a[data-role="addCon"]', function () {
                    that.contactsStatus = "create";
                    that.contactsId = "";
                    that.resetContactsForm({
                        wechat: "",
                        wechatnick: "",
                        qq: "",
                        companyid: -1,
                        tel: "",
                        city: 440100,
                        title: "",
                        address: "",
                        other: "",
                        email: "",
                        name: "",
                        province: 440000,
                        district: 440106,
                        mobile: ""
                    });
                }).on('click', 'a[data-role="editCon"]', function () {
                    that.contactsStatus = "modify";
                    that.contactsId = $(this).attr('data-value')*1;
                    that.fetchContacts();
                }).on('click', 'a[data-role="addCom"]', function () {
                    that.companyStatus = "create";
                    that.companyId = "";
                    that.resetCompanyForm({
                        name: "",
                        nickname: "",
                        tel: "",
                        description: "",
                        business: "",
                        registed: "",
                        peoples: "-1",
                        industry: "-1",
                        web: "",
                        fax: "",
                        province: 440000,
                        city: 440100,
                        district: 440106,
                        address: ""
                    });
                }).on('click', 'a[data-role="editCom"]', function () {
                    that.companyStatus = 'modify';
                    that.companyId = $(this).attr('data-value')*1;
                    that.fetchCompany();
                }).on('click', 'a[data-role="defCon"]', function () {
                    that.contactsStatus = "set";
                    that.contactsId = $(this).attr('data-value')*1;
                    that.updateContacts();
                }).on('click', 'a[data-role="delCon"]', function () {
                    that.showMessageBox({
                        id: this.getAttribute('data-value')
                    }, 'delCon');
                });

                $('#sbca-cancelBtn').on('click', function () {
                    that.queryContacts();
                    $('#sbca-contactors-form').removeClass('active');
                    $('#sbca-contactors-list').addClass('active');
                });

                $('#sbca-username-cancelBtn').on('click', function () {
                    $('#sbca-userNameform').removeClass('active');
                    if (common.userInfo.nickname) {
                        $('#sbca-form-tab').addClass('active');
                    } else {
                        $('#sbca-nickNameForm').addClass('active');
                    }
                });

                $('#sbcac-cancelBtn').on('click', function () {
                    var form = $('#sbca-company-form');
                    form.removeClass('active');
                    if (form.hasClass('sbca-company-border')) {
                        if (that.contactsData.companysContacts.length > 1) {
                            $('#sbca-companyLine').addClass('active');
                            $('#sbca-companyOpt').addClass('active');
                        } else {
                            $('#sbca-addCompanyLine').addClass('active');
                        }
                        $('#sbca-submitLine').addClass('active');
                        form.removeClass('sbca-company-border');
                    } else {
                        $('#sbca-contactors-list').addClass('active');
                    }
                    
                });

                $('#sbca-clearCompanyBtn').on('click', function () {
                    document.getElementById('sbca-company').value = -1;
                    $('#sbca-company').trigger('chosen:update');
                    $('#sbca-title').val('');
                });

                $('#sbce-info-btn').on('click', function () {
                    $('#sbc-phone-btn').trigger('click');
                });

                $('#sbcaf-addCom1, #sbcaf-addCom2').on('click', function () {
                    $('#sbca-addCompanyLine').removeClass('active');
                    $('#sbca-companyLine').removeClass('active');
                    $('#sbca-companyOpt').removeClass('active');
                    $('#sbca-submitLine').removeClass('active');
                    $('#sbca-company-form').addClass('sbca-company-border');
                    that.companyStatus = "create";
                    that.companyId = "";
                    that.resetCompanyForm({
                        name: "",
                        nickname: "",
                        tel: "",
                        description: "",
                        business: "",
                        registed: "",
                        peoples: "-1",
                        industry: "-1",
                        web: "",
                        fax: "",
                        province: 440000,
                        city: 440100,
                        district: 440106,
                        address: ""
                    });
                });
            },

            fetchContacts: function () {
                var that = this,
                    i = 0,
                    iLen = 0,
                    j = 0,
                    jLen = 0,
                    item = null;
                for(i = 0, iLen = this.contactsData.contactsWithoutCp.companycontactsList.length; i < iLen; i += 1) {
                    item = this.contactsData.contactsWithoutCp.companycontactsList[i];
                    if (this.contactsId === item.id*1) {
                        this.resetContactsForm(item);
                        return;
                    }
                }
                for (i = 0, iLen = this.contactsData.companysContacts.length; i < iLen; i += 1) {
                    for (j = 0, jLen = this.contactsData.companysContacts[i].companycontactsList.length; j < jLen; j += 1) {
                        item = this.contactsData.companysContacts[i].companycontactsList[j];
                        if (this.contactsId === item.id*1) {
                            this.resetContactsForm(item);
                            return;
                        }
                    }
                }
            },

            fetchCompany: function () {
                var that = this,
                    i = 0,
                    data = null,
                    item = null,
                    iLen = 0;
                for(i = 0, iLen = this.contactsData.companysContacts.length; i < iLen; i += 1) {
                    item = this.contactsData.companysContacts[i];
                    if (this.companyId*1 === item.id*1) {
                        data = this.contactsData.companysContacts[i];
                        break;
                    }
                }
                if (!data) {
                    for(i = 0, iLen = this.contactsData.ucWithoutContacts.length; i < iLen; i += 1) {
                        item = this.contactsData.ucWithoutContacts[i];
                        if (this.companyId*1 === item.id*1) {
                            data = this.contactsData.ucWithoutContacts[i];
                            break;
                        }
                    }
                }
                this.resetCompanyForm(data);
            },

            showMessageBox: function (data, type) {
                var that = this,
                    html = "",
                    source = "",
                    template = null;
                if (type === "delCom") {
                    source = $('#del_company_template').html();
                } else if (type === "delComNC") {
                    source = $('#del_company_noContacts_template').html();
                } else if (type === "delCon") {
                    source = $('#del_contacts_template').html();
                } else if (type === "unbindQQ") {
                    source = $('#unbind_qq_template').html();
                } else if (type === "unbindWx") {
                    source = $('#unbind_wx_template').html();
                } else if (type === "qqTips") {
                    source = $('#qq_tips_template').html();
                } else if (type === "wxTips") {
                    source = $('#wx_tips_template').html();
                } else if (type === "bindingSuccess") {
                    source = $('#binging_success_template').html();
                } else if (type === "unbindSuccess") {
                    source = $('#unbind_success_template').html();
                }
                template = Handlebars.compile(source);
                html = template(data);
                info.show({
                    content: html
                });
                
                $('#message-box').on('click', 'a', function () {
                    if (this.id === "mb-keepCon") {
                        that.deleteCompany(this.getAttribute('data-value'), 0);
                    } else if (this.id === "mb-cancelBtn") {
                        info.close();
                    } else if (this.id === "mb-delCon") {
                        that.deleteContact(this.getAttribute('data-value'));
                    } else if (this.id === "mb-delAll") {
                        that.deleteCompany(this.getAttribute('data-value'), 1);
                    } else if (this.id === "mb_submitBtn") {

                    }
                });
            },

            updateCompany: function () {
                var that = this,
                    form = document.forms.companyForm,
                    params = {
                        name: form.name.value,
                        nickname: form.nickname.value,
                        description: form.description.value,
                        registed: form.registed.value,
                        tel: form.tel.value,
                        fax: form.fax.value,
                        web: form.web.value,
                        industry: form.industry.value,
                        business: form.business.value,
                        peoples: form.peoples.value,
                        province: form.province.value,
                        city: form.city.value,
                        district: form.district.value,
                        address: form.address.value
                    },
                    url = "",
                    request = null;

                if (this.companyStatus === "create"){
                    params.userid = common.userInfo.id;
                    url = "/user/addCompany.htm";
                } else if ( this.companyStatus === "modify") {
                    params.companyid = this.companyId;
                    url = "/user/editCompany.htm";
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if ($('#sbca-company-form').hasClass("sbca-company-border")) {
                            $('#sbca-company-form').removeClass('active');
                            that.getCompanyDetailList(data.re.companyid);
                        } else {
                            that.queryContacts();
                        }
                        
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            deleteCompany: function (id, isDelContact) {
                var that = this,
                    params = {
                        companyid: id,
                        isDelContact: isDelContact
                    },
                    request = new Ajax("/user/delMyCompanyById.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                        info.close();
                        that.queryContacts();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            deleteContact: function (id) {
                var that = this,
                    params = {
                        contactid: id
                    },
                    request = new Ajax("/user/delMyContact.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                        info.close();
                        that.queryContacts();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            resetSwitchBtn: function () {
                $('a[data-role="switch"]').each(function (index) {
                    if (this.id === "sbc-email-btn") {
                        $(this).text(common.userInfo.email === "" ? this.getAttribute('data-init-text') : this.getAttribute('data-expand-text'));
                    } else if (this.id === "sbc-phone-btn") {
                        $(this).text(common.userInfo.mobile === "" ? this.getAttribute('data-init-text') : this.getAttribute('data-expand-text'));
                    } else {
                        $(this).text(this.getAttribute('data-expand-text'));
                    }
                });
            },

            boxSwitch: function (obj) {
                var that = this,
                    target = obj.getAttribute('data-target');
                this.resetSwitchBtn();
                if (target === "sbc-account-box") {
                    $('#sbca-tab').find('li').each(function (index) {
                        $(this).removeClass('active');
                        if (index === 0) {
                            $(this).addClass('active');
                        }
                    });
                    $('#sbca-account').addClass('active').find('.active').removeClass('.active');
                    $('#sbca-contactors').removeClass('active');
                    if (common.userInfo.nickname) {
                        $('#sbca-nickNameForm').removeClass('active');
                        $('#sbca-form-tab').addClass('active');
                    } else {
                        $('#sbca-nickNameForm').addClass('active');
                        $('#sbca-form-tab').removeClass('active');
                    }
                    
                    $('#sbca-userNameform').removeClass('active');
                    setTimeout(function () {
                        that.packageContacts();
                    }, 50);
                    
                } else if (target === "sbc-password-box"){
                    this.resetForm($('#' + target));
                    $('#' + $('#sbcp-tab').find('.active').attr('data-target')).find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                } else if (target === "sbc-phone-box") {
                    this.resetForm($('#' + target));
                    $('#sbc-phone-box ol.active').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                } else if (target === "sbc-email-box") {
                    this.resetForm($('#' + target));
                    $('#sbc-email-box ol.active').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                }

                $('#' + target).find('input').val('').removeClass('valid invalid');
                $('#' + target).find('span.error').hide();

                

                if ($('#' + target).hasClass('active')){
                    if (target === "sbc-phone-box") {
                        $(obj).html(common.userInfo.mobile ? $(obj).attr('data-expand-text') : $(obj).attr('data-init-text'));
                    } else if (target === "sbc-email-box") {
                        $(obj).html(common.userInfo.email ? $(obj).attr('data-expand-text') : $(obj).attr('data-init-text'));
                    } else {
                        $(obj).html($(obj).attr('data-expand-text'));
                    }
                    $('.sbc-box').removeClass('active');
                } else {
                    $(obj).html($(obj).attr('data-collapse-text'));
                    $('.sbc-box').removeClass('active');
                    $('#' + target).addClass('active');
                } 
            },

            formAction: function () {
                var that = this,
                    nickNameVt = new FormVerified(document.forms.nickNameForm, function () {
                        that.nickNameUpdate();
                    }),
                    userNameVt = new FormVerified(document.forms.userNameform, function () {
                        that.userMdConfirm();
                    }),
                    contactsVt = new FormVerified(document.forms.contactorForm, function () {
                        that.updateContacts();
                    }),
                    phonePasswordVt = new FormVerified(document.forms.passwordPhoneForm, function () {
                        that.getAccesskey("passwordPhoneForm");
                    }),
                    passwordUpdateVt = new FormVerified(document.forms.updatePassword, function () {
                        that.updatePassword();
                    }),
                    passwordVt = new FormVerified(document.forms.passwordForm, function () {
                        that.getAccesskey("passwordForm");
                    }),
                    checkPhoneVt = new FormVerified(document.forms.checkPhoneForm, function () {
                        that.getAccesskey("checkPhoneForm");
                    }),
                    bindVt = new FormVerified(document.forms.bindMobile, function () {
                        that.updatePhone("bindMobile");
                    }),
                    rebindVt = new FormVerified(document.forms.rebindMobile, function () {
                        that.updatePhone("rebindMobile");
                    }),
                    checkIdByPhoneIE = new FormVerified(document.forms.checkIdByPhoneInEmail, function () {
                        that.getAccesskey("checkIdByPhoneInEmail");
                    }),
                    getCodeIE = new FormVerified(document.forms.getCodeInEmail, function () {
                        that.getCodeIE();
                    }),
                    checkIdByEmailInEmail = new FormVerified(document.forms.checkIdByEmailInEmail, function () {
                        that.getEmailCode("checkIdByEmailInEmail");
                    }),
                    getEmailCodeIE = new FormVerified(document.forms.getEmailCodeIE, function () {
                        that.getAccesskey("getEmailCodeIE");
                    }),
                    getEmailCodeIP = new FormVerified(document.forms.getEmailCodeIP, function () {
                        that.getEmailCode("getEmailCodeIP");
                    }),
                    emailCodeVt = new FormVerified(document.forms.checkIdByEmailIP, function () {
                        that.getAccesskey("checkIdByEmailIP");
                    }),
                    bindEmailVt = new FormVerified(document.forms.bindEmail, function () {
                        that.bindEmail();
                    }),
                    companyVt = new FormVerified(document.forms.companyForm, function () {
                        that.updateCompany();
                    });
                contactsVt.checkQQ = function (value, notRequire) {
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
                contactsVt.checkWechat = function (value, notRequire) {
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

                contactsVt.checkTitle = function (value, notRequire) {
                    if ($('#sbca-company').val() !== "-1") {
                        if (!/^[\u4E00-\u9FBFA-Za-z0-9]{2,20}$/.test(value)) {
                            return "请输入职位";
                        }
                    } else {
                        return "";
                    }
                    return "";
                };

                passwordUpdateVt.checkPassword = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^\S{6,20}$/.test(value)){
                        return "请输入6-20位非空格字符";
                    }
                    return "";
                };

                passwordVt.checkPassword = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^\S{6,20}$/.test(value)){
                        return "请输入6-20位非空格字符";
                    }
                    return "";
                };

                contactsVt.checkPosition = function (value, notRequire) {
                    if (this.checkDirty(value, notRequire)) {
                        return this.messageInfo.dirty;
                    } else if (!value) {
                        return "";
                    }
                    if (!/^[\w\W]{2,20}$/.test(value)) {
                        return '请输入2-20位字符';
                    }
                    return "";
                };
            },

            nickNameUpdate: function () {
                var that = this,
                    form = document.forms.nickNameForm,
                    params = {
                        nickname: form.nickname.value
                    },
                    request = new Ajax("/user/updateUserInfos.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $('#sbca-nickNameText').html(form.nickname.value);
                        common.userInfo.nickname = form.nickname.value;
                        $('#sbca-nickNameForm').removeClass('active');
                        $(form.nickname).removeClass('valid invalid');
                        $('#sbca-form-tab').addClass('active');
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            userMdConfirm: function () {
                var that = this;
                dialog.show({
                    content: "用户名只能修改一次，提交成功则不能再修改！",
                    buttons: [{
                        name: "确定",
                        callBack: function () {
                            dialog.close();
                            that.userNameUpdate();
                        }
                    }, {
                        name: "取消",
                        callBack: function () {
                            dialog.close();
                        }
                    }]
                });
            },

            resetForm: function (target) {
                target.find('.valid').removeClass('.valid');
                target.find('.invalid').removeClass('.invalid');
                target.find('input[type="text"]').val("");
            },

            userNameUpdate: function () {
                var that = this,
                    form = document.forms.userNameform,
                    params = {
                        username: form.username.value
                    },
                    request = new Ajax("/user/updateNewUserNameOnce.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $('[data-role="username"]').html(form.username.value);
                        $('#tb-user').html(form.username.value);
                        $('a[data-role="modifyUsername"]').removeAttr('style');
                        dialog.show({
                            content: "修改成功",
                            buttons: [{
                                name: "确定",
                                callBack: function () {
                                    if (common.userInfo.nickname) {
                                        $('#sbca-form-tab').addClass('active');
                                        $('#sbca-nickNameForm').removeClass('active');
                                    } else {
                                        $('#sbca-nickNameForm').addClass('active');
                                        $('#sbca-form-tab').removeClass('active');
                                    }
                                    $('#sbca-userNameform').removeClass('active');
                                    $(form.username).removeClass('valid invalid');
                                    dialog.close();
                                }
                            }]
                        });
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            selectAction: function () {
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbca-province'), selected: "440000"});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbca-city'), value: "440000", selected: "440100", isCity: true});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbca-district'), value: "440100", selected: "440106", isCity: false});
                $('#sbca-province').change(function () {
                    addrsCtrl.addressSelectAction({
                        selectObj: document.getElementById('sbca-city'),
                        value: this.value,
                        resetObj: document.getElementById('sbca-district'),
                        isCity: true
                    });
                });
                $('#sbca-city').change(function () {
                    addrsCtrl.addressSelectAction({
                        selectObj: document.getElementById('sbca-district'),
                        value: this.value,
                        isCity: false
                    });
                });
            },

            queryContacts: function () {
                var that = this,
                    request = new Ajax("/user/newQryContacts195.htm");
                request.done(function (data) {
                    if (data.status === "200") {
                        that.contactsData = data.re;
                        that.packageContacts();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            resetContactsForm: function (data) {
                var form = document.forms.contactorForm;
                $(form).find('.valid').removeClass('valid');
                $(form).find('.invalid').removeClass('invalid');
                form.name.value = data.name;
                form.mobile.value = data.mobile;
                form.tel.value = data.tel || "";
                form.email.value = data.email || "";
                form.qq.value = data.qq || "";
                form.wechat.value = data.wechat || "";
                form.wechatnick.value = data.wechatnick || "";
                form.other.value = data.other || "";
                form.title.value = data.title || "";
                form.province.value = data.province || 440000;
                form.city.value = data.city || 440100;
                form.district.value = data.district || 440106;
                form.address.value = data.address || "";
                addrsCtrl.addressSelectAction({
                    selectObj: document.getElementById('sbca-province'), 
                    selected: data.province ? data.province.toString() : "440000"
                });
                addrsCtrl.addressSelectAction({
                    selectObj: document.getElementById('sbca-city'), 
                    value: data.province ? data.province.toString() : "440000", 
                    selected: data.city ? data.city.toString() : "440100", 
                    isCity: true
                });
                addrsCtrl.addressSelectAction({
                    selectObj: document.getElementById('sbca-district'), 
                    value: data.city ? data.city.toString() : "440100",
                    selected: data.district ? data.district.toString() : "440106", 
                    isCity: false
                });
                this.getCompanyDetailList(data.companyid);
            },

            getCompanyDetailList: function (id) {
                var that = this,
                    i = 0,
                    iLen = 0,
                    item = null,
                    select = document.getElementById('sbca-company'),
                    html = [],
                    request = new Ajax('/user/getCompanyDetailList.htm');
                request.done(function (data) {
                    if (data.status === "200") {
                        if (data.re.companys.length) {
                            html.push('<option value="-1">不从属任何公司</option>');
                            for(i = 0, iLen = data.re.companys.length; i < iLen; i += 1) {
                                item = data.re.companys[i];
                                html.push('<option value="' + item.id + '">' + item.name + '</option>');
                            }
                            $(select).empty().append(html.join(''));
                            select.value = id || -1;
                            $(select).trigger('chosen:update');
                            $('#sbca-addCompanyLine').removeClass('active');
                            $('#sbca-companyLine').addClass('active');
                            $('#sbca-companyOpt').addClass('active');
                        } else {
                            $(select).empty().append('<option value="-1">不从属任何公司</option>');
                            select.value = -1;
                            $(select).trigger('chosen:update');
                            $('#sbca-addCompanyLine').addClass('active');
                            $('#sbca-companyLine').removeClass('active');
                            $('#sbca-companyOpt').removeClass('active');
                        }
                        $('#sbca-submitLine').addClass('active');
                        $('#sbca-company-form').removeClass('sbca-company-border');
                        $('#sbca-contactors-list').removeClass('active');
                        $('#sbca-contactors-form').addClass('active');
                    }
                });

            },

            resetCompanyForm: function (data) {
                var form = document.forms.companyForm;
                $(form).find('.valid').removeClass('valid');
                $(form).find('.invalid').removeClass('invalid');
                form.name.value = data.name;
                form.nickname.value = data.nickname;
                form.description.value = data.description;
                form.business.value = data.business;
                form.registed.value = data.registed;
                form.peoples.value = data.peoples;
                form.tel.value = data.tel;
                form.industry.value = data.industry;
                form.province.value = data.province;
                form.city.value = data.city;
                form.district.value = data.district;
                form.address.value = data.address;
                form.fax.value = data.fax;
                form.web.value =data.web;
                $('#sbcac-industry').trigger('chosen:update');
                $('#sbcac-peoples').trigger('chosen:update');
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbcac-province'), selected: data.province.toString()});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbcac-city'), value: data.province.toString(), selected: data.city.toString(), isCity: true});
                addrsCtrl.addressSelectAction({selectObj: document.getElementById('sbcac-district'), value: data.city.toString(), selected: data.district.toString(), isCity: false});
                $('#sbca-contactors-list').removeClass('active');
                $('#sbca-company-form').addClass('active');
            },

            packageContacts: function () {
                var that = this,
                    contactsForm = $('#sbca-contactors-form'),
                    companyForm = $('#sbca-company-form'),
                    cancelBtn = $('#sbca-cancelBtn'),
                    list = $('#sbca-contactors-list'),
                    html = "",
                    i = 0,
                    iLen = 0,
                    j = 0, 
                    jLen = 0,
                    source = $('#contactor-list-template').html(),
                    template = Handlebars.compile(source),
                    flag = false;
                if (this.contactsData.contactsWithoutCp.companycontactsList.length) {
                    flag = true;
                }
                for (i = 0, iLen = this.contactsData.companysContacts.length; i < iLen; i += 1) {
                    if (this.contactsData.companysContacts[i].companycontactsList) {
                        flag = true;
                    }
                }
                if (flag) {
                    html = template(this.contactsData);
                    list.empty().append(html);
                    list.addClass('active');
                    cancelBtn.show();
                    contactsForm.removeClass('active');
                    companyForm.removeClass('sbca-company-border active');
                } else {
                    html = template(this.contactsData);
                    list.empty().append(html);
                    that.resetContactsForm({
                        wechat: "",
                        wechatnick: "",
                        qq: "",
                        companyid: -1,
                        tel: "",
                        city: 440100,
                        title: "",
                        address: "",
                        other: "",
                        email: "",
                        name: "",
                        province: 440000,
                        district: 440106,
                        mobile: ""
                    });
                    this.contactsStatus = "create";
                    list.removeClass('active');
                    cancelBtn.hide();
                    contactsForm.addClass('active');
                    companyForm.removeClass('sbca-company-border active');
                }
            },

            updateContacts: function () {
                var that = this,
                    form = document.forms.contactorForm,
                    params = {
                        name: form.name.value,
                        mobile: form.mobile.value,
                        tel: form.tel.value,
                        email: form.email.value,
                        title: form.title.value,
                        qq: form.qq.value,
                        wechat: form.wechat.value,
                        wechatnick: form.wechatnick.value,
                        other: form.other.value,
                        province: form.province.value,
                        city: form.city.value,
                        district: form.district.value,
                        address: form.address.value,
                        companyid: form.companyid.value
                    },
                    url = "",
                    request = null;
                if (this.contactsStatus === "create" && this.hasSameContact({
                    name: form.name.value,
                    mobile: form.mobile.value,
                }) || this.contactsStatus === "modify"  && this.hasSameContact({
                    id: this.contactsId,
                    name: form.name.value,
                    mobile: form.mobile.value,
                })) {
                    dialog.show({
                        content: "该联系人信息已存在"
                    });
                    return;
                }
                if (this.contactsStatus === "create"){
                    params.userid = common.userInfo.id;
                    url = "/user/newAddContact.htm";
                } else if ( this.contactsStatus === "modify") {
                    params.id = this.contactsId;
                    url = "/user/newEditContacts.htm";
                } else if (this.contactsStatus === "set") {
                    params = {
                        id: this.contactsId,
                        isdefault: 1
                    };
                    url = "/user/setDefaultContacts.htm";
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.queryContacts();
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            hasSameContact: function (data) {
                var that = this,
                    i = 0,
                    j = 0,
                    item = null,
                    iLen = 0,
                    jLen = 0;
                for (i = 0, iLen = this.contactsData.contactsWithoutCp.companycontactsList.length; i < iLen; i += 1) {
                    item = this.contactsData.contactsWithoutCp.companycontactsList[i];
                    if (data.id) {
                        if (data.id !== item.id*1 && data.name === item.name && data.mobile === item.mobile) {
                            return true;
                        }
                    } else {
                        if (data.name === item.name && data.mobile === item.mobile) {
                            return true;
                        }
                    }
                }

                for (i = 0, iLen = this.contactsData.companysContacts.length; i < iLen; i += 1) {
                    for(j = 0, jLen = this.contactsData.companysContacts[i].companycontactsList.length; j < jLen; j += 1) {
                        item = this.contactsData.companysContacts[i].companycontactsList[j];
                        if (data.id) {
                            if (data.id !== item.id*1 && data.name === item.name && data.mobile === item.mobile) {
                                return true;
                            }
                        } else {
                            if (data.name === item.name && data.mobile === item.mobile) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },

            getPhoneCode: function (formName, btn) {
                var that = this,
                    form = document.forms[formName],
                    request = null,
                    hasError = false,
                    url = "",
                    params = {
                        validateCodeImg: form.validateCodeImg.value
                    };
                    if (form.validateCodeImg.value.length !== 4) {
                        $(form.validateCodeImg).addClass('invalid');
                        hasError = true;
                    }
                    if (formName === "passwordPhoneForm" || 
                        formName === "checkPhoneForm" ||
                        formName === "checkIdByPhoneInEmail") {
                        url = "/common/sendValidateCode4ValidateID8MobileNo.htm";  
                    } else if (formName === "bindMobile" || formName === "rebindMobile") {
                        url = "/common/sendValidateCode.htm";
                        params.phoneNo = form.phoneNo.value;
                        if (!/^1(3[0-9]|4[0-9]|5[0-35-9]|7[0-9]|8[0-9])\d{8}$/.test(form.phoneNo.value)) {
                            $(form.phoneNo).addClass('invalid');
                            hasError = true;
                        }
                    }
                if (hasError) {
                    return;
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $(form.validateCodeImg).removeClass('invalid valid');
                        $(form.phoneNo).removeClass('invalid valid');
                        dialog.show({
                            content: "已发送验证码，请注意查收"
                        });
                        that.startCountDown(btn, 60);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            getAccesskey: function (formName) {
                var that = this,
                    form = document.forms[formName],
                    url = "",
                    params = {
                        validatecode: form.validatecode.value
                    },
                    request = null;
                if (formName === "getEmailCodeIE" || formName === "checkIdByEmailIP") {
                    url = "/common/checkValidateID.htm";
                } else if (formName === "passwordPhoneForm" || 
                    formName === "checkPhoneForm" ||
                    formName === "checkIdByPhoneInEmail") {
                    url = "/common/checkValidateID8MobileNo.htm";
                } else if (formName  === "passwordForm") {
                    url = "/user/checkID8OldPassword.htm";
                    params = {
                        oldpassword: form.oldpassword.value,
                        validateCodeImg: form.validatecode.value
                    };
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        that.accesskey = data.re.accesskey;
                        if (formName === "passwordPhoneForm" ||
                            formName === "checkIdByEmailIP") {
                            $('#sbcp-phone-form').removeClass('active');
                            $('#sbb-checkIdByEmailIP-form').removeClass('active');
                            $('#sbcp-tab').hide();
                            $('#sbp-tips').removeClass('active');
                            $('#sbcp-update-form').addClass('active');
                            $('#sbcp-steps-box').find('li').eq(1).addClass('active');
                        } else if (formName === "checkPhoneForm") {
                            $('#sbb-phone-form').removeClass('active');
                            $('#sbb-tips').hide();
                            $('#sbb-rebindMobile-form').addClass('active').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                            $('#sbb-steps-box-2').find('li').eq(1).addClass('active');
                        } else if (formName === "checkIdByPhoneInEmail") {
                            $('#sbb-cibpie-form').removeClass('active');
                            $('#sbb-gcie-form').addClass('active').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                            $('#sbce-tab').removeClass('active');
                            $('#sbce-steps-box').find('li').eq(1).addClass('active');
                        } else if (formName === "getEmailCodeIE") {
                            $('#sbb-getEmailCodeIE-form').removeClass('active');
                            $('#sbb-gcie-form').addClass('active').find('img').attr('src', '/vc.htm?v=' + new Date().getTime());
                            $('#sbce-tab').removeClass('active');
                            $('#sbe-tips').removeClass('active');
                            $('#sbce-steps-box').find('li').eq(1).addClass('active');
                        } else if (formName  === "passwordForm") {
                            $('#sbcp-password-form').removeClass('active');
                            $('#sbcp-tab').hide();
                            $('#sbcp-update-form').addClass('active');
                            $('#sbcp-steps-box').find('li').eq(1).addClass('active');
                        }
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            updatePassword: function () {
                var that = this,
                    steps = $('#sbcp-steps-box'),
                    tab = $('#sbcp-tab'),
                    form = document.forms.updatePassword,
                    params = {
                        newpassword: form.newpassword.value,
                        confirmpassword: form.confirmpassword.value,
                        accesskey: this.accesskey
                    },
                    request = new Ajax("/user/updateNewUser8Accesskey.htm", params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $('#sbcp-update-form').removeClass('active');
                        steps.find('li').eq(2).addClass('active');
                        $('#sbp-success-box').addClass('active');
                        $('#sbc-password-box').delay(1000).slideUp(function () {
                            tab.show();
                            steps.find('li').each(function (index) {
                                if (index !== 0) {
                                    $(this).removeClass('active');
                                }
                            });
                            tab.find('li').each(function () {
                                if($(this).hasClass('active')) {
                                    $('#' + $(this).attr('data-target')).addClass('active');
                                }
                            });
                            $('#sbp-success-box').removeClass("active");
                            $('#sbc-password-box').removeClass('active').removeAttr('style');
                            $('#sbc-password-btn').html("设置");
                        });
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            updatePhone: function (formName) {
                var that = this,
                    url = "",
                    step1 = $('#sbb-steps-box-1'),
                    step2 = $('#sbb-steps-box-2'),
                    tip = $('#sbb-tips'),
                    request = null,
                    form = document.forms[formName],
                    params = {
                        validatecode: form.validatecode.value
                    };
                if (formName === "bindMobile") {
                    url = "/user/bindUserMobile.htm";
                } else if (formName === "rebindMobile") {
                    url = "/user/rebindUserMobile.htm";
                    params.accesskey = this.accesskey;
                }
                request = new Ajax(url, params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (formName === "bindMobile") {
                            $('#sbb-bindMobile-form').removeClass('active');
                            step1.find('li').eq(1).addClass('active');
                        } else if (formName === "rebindMobile") {
                            $('#sbb-bindMobile-form').removeClass('active');
                            step2.find('li').eq(2).addClass('active');
                        }
                        $('#sbb-success-box').addClass('active');
                        $('#sbc-phone-box').delay(1000).slideUp(function () {
                            window.location.reload();
                        });
                        
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            getCodeIE: function (isRepeat) {
                var that = this,
                    form = document.forms.getCodeInEmail,
                    index = 0,
                    strArray = [],
                    i = 0,
                    iLen = 0,
                    emailVal = form.email.value,
                    params = {
                        email: emailVal,
                        validateCodeImg: form.validateCodeImg.value,
                        accesskey: this.accesskey
                    },
                    request = new Ajax('/user/sendValidateCode2Email.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (!isRepeat) {
                            $('#sbb-gcie-form').removeClass('active');
                            $('#sbb-bindEmail-form').addClass('active');
                            index = emailVal.indexOf('@');
                            for (i = 0, iLen = index - 1; i < iLen; i += 1) {
                                strArray.push('*');
                            }
                            $('#sbe-tips-email').html(emailVal.charAt(0) + strArray.join('') + emailVal.substring(index - 1));
                            $('#sbe-tips').addClass('active');
                        }
                        that.startCountDown($('#seb-getBindCode'), 120);
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            getEmailCode: function (formName, isRepeat) {
                var that = this,
                    form = document.forms[formName],
                    params = {
                        validateCodeImg: form.validateCodeImg.value
                    },
                    request = new Ajax('/common/sendValidateCode2BingEmail.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        if (!isRepeat) {
                            if (formName === "checkIdByEmailInEmail") {
                                $('#sbb-cibeie-form').removeClass('active');
                                $('#sbb-getEmailCodeIE-form').addClass('active');
                                $('#sbe-tips-email').html(common.userInfo.email);
                                $('#sbe-tips').addClass('active');
                            }  else if (formName === "getEmailCodeIP") {
                                $('#sbb-getEmailCodeIP-form').removeClass('active');
                                $('#sbb-checkIdByEmailIP-form').addClass('active');
                                $('#sbp-tips-email').html(common.userInfo.email);
                                $('#sbp-tips').addClass('active');
                            }
                        }
                        if (formName === "checkIdByEmailInEmail") {
                            that.startCountDown($('#seb-getEmailCode'), 120);
                        } else if (formName === "getEmailCodeIP") {
                            that.startCountDown($('#seb-getEmailCodeIP'), 120);
                        }
                    } else {
                        common.errorDialog(data);
                    }
                });
            },

            bindEmail: function () {
                var form = document.forms.bindEmail,
                    params = {
                        emailValidateCode: form.emailValidateCode.value
                    },
                    request = new Ajax('/user/bingEmail.htm', params);
                request.done(function (data) {
                    if (data.status === "200") {
                        $('#sbb-bindEmail-form').removeClass('active');
                        $('#sbe-tips').removeClass('active');
                        $('#sbce-steps-box').find('li').eq(2).addClass('active');
                        $('#sbe-success-box').addClass('active');
                        $('#sbc-email-box').delay(1000).slideUp(function () {
                            window.location.reload();
                        });
                    } else {
                        common.errorDialog(data);
                    }
                    
                });
            },

            startCountDown: function (btn, i) {
                var that = this,
                    countDown = function () {
                        i -= 1;
                        if (i <= 0) {
                            that.onCountDown = false;
                            btn.html('获取验证码');
                        } else {
                            btn.html('<em>' + i + '</em>秒后重新获取');
                            Settings.TIMEFLAG = setTimeout(countDown, 1000);
                        }
                    };
                this.countDownBtn = btn;
                this.onCountDown = true;
                countDown();
            },

            checkCountDown: function (btn) {
                var that = this;
                if (this.onCountDown && btn[0] === this.countDownBtn[0]) {
                    return true;
                } else if (!this.onCountDown) {
                    return false;
                } else if (this.onCountDown && btn[0] !== this.countDownBtn[0]) {
                    this.countDownBtn.html('获取验证码');
                    this.onCountDown = false;
                    clearTimeout(Settings.TIMEFLAG);
                    return false;
                }
            }
        };

        var settings = new Settings();
    });
}(window.requirejs));