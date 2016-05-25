define(["jquery", 'serviceList'], function ($) {
    "use strict";
    var serviceCtrl = {
        clearSelectbox: function (selectbox) {
            var i = 0,
                length = 0,
                target = null;
            if (selectbox.getAttribute('data-target') !== null) {
                target = selectbox.getAttribute('data-target');
                $('#' + target).text("请选择");
            }
            for (i = 0, length = selectbox.options.length; i < length; i += 1) {
                selectbox.remove(0);
            }
        },

        serviceSelectAction: function (params) {
            var items = null,
                i = 0,
                length = 0,
                option = null,
                optionElement = null,
                firstOption = document.createElement('option');

            if (params.selected === "请选择") {
                firstOption.appendChild(document.createTextNode("请选择"));
                firstOption.setAttribute("value", "");
                firstOption.setAttribute("selected", "true");
            } else if (params.selected === "所有") {
                firstOption.appendChild(document.createTextNode("所有"));
                firstOption.setAttribute("value", "");
            } else {
                firstOption.appendChild(document.createTextNode("请选择"));
                firstOption.setAttribute("value", "");
            }
            serviceCtrl.clearSelectbox(params.selectObj);
            if (params.value !== "请选择" && params.value !== "") {
                items = serviceCtrl.qryData(params.value, params.isService);
                length = items.length;
                if (length !== 0) {
                    params.selectObj.appendChild(firstOption);
                    for (i = 0; i < length; i += 1) {
                        optionElement = document.createElement('option');
                        optionElement.appendChild(document.createTextNode(items[i].name));
                        optionElement.setAttribute("value", items[i].code);
                        if (items[i].code === parseInt(params.selected, 10)) {
                            optionElement.setAttribute("selected", "true");
                            $('#' + params.selectObj.getAttribute('data-target')).text(optionElement.innerHTML);
                        }
                        params.selectObj.appendChild(optionElement);

                    }
                }
            } else {
                params.selectObj.appendChild(firstOption);
            }
            if (params.resetObj !== undefined) {
                serviceCtrl.clearSelectbox(params.resetObj);
                firstOption = document.createElement('option');
                firstOption.appendChild(document.createTextNode("请选择"));
                firstOption.setAttribute("value", "");
                params.resetObj.appendChild(firstOption);
            }

        },

        qryData: function (parentCode, isService) {
            var i = 0,
                j = 0,
                k = 0,
                iLength = ycs_sys_sers.length,
                jLength = 0,
                kLength = 0,
                result = [];
            if (parentCode !== undefined) {
                if (isService) {
                    for (i = 0; i < iLength; i += 1) {
                        for (j = 0, jLength = ycs_sys_sers[i].sub.length; j < jLength; j += 1) {
                            if (parseInt(parentCode, 10) !== ycs_sys_sers[i].sub[j].code) {
                                continue;
                            }
                            for (k = 0, kLength =  ycs_sys_sers[i].sub[j].services.length; k < kLength; k += 1) {
                                result.push({
                                    code: ycs_sys_sers[i].sub[j].services[k].id,
                                    name: ycs_sys_sers[i].sub[j].services[k].name
                                });
                            }
                        }
                    }
                } else {
                    for (i = 0; i < iLength; i += 1) {
                        if (parseInt(parentCode, 10) !== ycs_sys_sers[i].code) {
                            continue;
                        }
                        for (j = 0, jLength = ycs_sys_sers[i].sub.length; j < jLength; j += 1) {
                            result.push({
                                code: ycs_sys_sers[i].sub[j].code,
                                name: ycs_sys_sers[i].sub[j].name
                            });
                        }
                    }
                }
            } else {
                for (i = 0; i < iLength; i += 1) {
                    result.push({
                        code: ycs_sys_sers[i].code,
                        name: ycs_sys_sers[i].name
                    });
                }
            }
            return result;
        }
    };
    
    return serviceCtrl;
});