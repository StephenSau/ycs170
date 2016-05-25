define(["jquery", 'sersAddrs'], function ($) {
    "use strict";
    var sersAddrsCtrl = {
        clearSelectbox: function (selectbox) {
            var i = 0,
                length = 0,
                target = null;
            if (selectbox.getAttribute('data-target') !== null) {
                target = selectbox.getAttribute('data-target');
                document.getElementById(target).innerHTML = "请选择";
            }
            for (i = 0, length = selectbox.options.length; i < length; i += 1) {
                selectbox.remove(0);
            }
        },

        addressSelectAction: function (params) {
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
            sersAddrsCtrl.clearSelectbox(params.selectObj);
            if (params.value !== "请选择" && params.value !== "") {
                items = sersAddrsCtrl.qryPlace(params.value, params.isCity);
                length = items.length;
                if (length !== 0) {
                    params.selectObj.appendChild(firstOption);
                    for (i = 0; i < length; i += 1) {
                        optionElement = document.createElement('option');
                        optionElement.appendChild(document.createTextNode(items[i].name));
                        optionElement.setAttribute("value", items[i].code);
                        if (items[i].code === parseInt(params.selected, 10)) {
                            optionElement.setAttribute("selected", "true");
                            document.getElementById(params.selectObj.getAttribute('data-target')).innerHTML = optionElement.innerHTML;
                        }
                        if (items[i].id !== undefined) {
                            optionElement.setAttribute("data-value", items[i].id);
                        }
                        params.selectObj.appendChild(optionElement);
                    }
                }
            } else {
                params.selectObj.appendChild(firstOption);
            }
            if (params.resetObj !== undefined) {
                sersAddrsCtrl.clearSelectbox(params.resetObj);
                firstOption = document.createElement('option');
                firstOption.appendChild(document.createTextNode("请选择"));
                firstOption.setAttribute("value", "");
                params.resetObj.appendChild(firstOption);
            }
        },

        qryPlace: function (parentCode, isCity) {
            var i = 0,
                j = 0,
                k = 0,
                provinceLength = ycs_service_addrs.length,
                cityLength = 0,
                districtLength = 0,
                result = [];
            if (parentCode !== undefined) {
                if (isCity) {
                    for (i = 0; i < provinceLength; i += 1) {
                        if (parseInt(parentCode, 10) !== ycs_service_addrs[i].c) {
                            continue;
                        }
                        for (j = 0, cityLength = ycs_service_addrs[i].s.length; j < cityLength; j += 1) {
                            result.push({
                                code: ycs_service_addrs[i].s[j].c,
                                name: ycs_service_addrs[i].s[j].n
                            });
                        }
                    }
                } else {
                    for (i = 0; i < provinceLength; i += 1) {
                        if (parseInt(parentCode.substr(0, 2).concat("0000"), 10) !== ycs_service_addrs[i].c) {
                            continue;
                        }
                        for (j = 0, cityLength = ycs_service_addrs[i].s.length; j < cityLength; j += 1) {
                            if (parseInt(parentCode, 10) !== ycs_service_addrs[i].s[j].c) {
                                continue;
                            }
                            for (k = 0, districtLength =  ycs_service_addrs[i].s[j].s.length; k < districtLength; k += 1) {
                                result.push({
                                    code: ycs_service_addrs[i].s[j].s[k].c,
                                    name: ycs_service_addrs[i].s[j].s[k].n
                                });
                            }
                        }
                    }
                }
            } else {
                for (i = 0; i < provinceLength; i += 1) {
                    result.push({
                        code: ycs_service_addrs[i].c,
                        name: ycs_service_addrs[i].n
                    });
                }
            }
            return result;
        },
        
        qryName: function (code) {
            var tempList = null,
                province = 0,
                city = 0,
                dichotomy = function (value, min, max, list, median) {
                    var result = null;
                    if (median === Math.round((min + max) / 2)) {
                        return null;
                    } else {
                        median = Math.round((min + max) / 2);
                    }
                    if (value === list[min].c) {
                        return list[min];
                    } else if (value > list[median].c) {
                        result = dichotomy(value, median, max, list, median);
                    } else if (value < list[median].c) {
                        result = dichotomy(value, min, median, list, median);
                    } else if (value === list[median].c) {
                        return list[median];
                    }
                    return result;
                };
            code = parseInt(code, 10);
            province = Math.floor(code / 10000);
            if (province === 11 ||
                    province === 12 ||
                    province === 31 ||
                    province === 50) {
                city = province * 10000 + 100;
            } else {
                city = Math.floor(code / 100) * 100;
            }
            
            
            if (code % 10000 === 0) {
                tempList = dichotomy(code, 0, ycs_service_addrs.length - 1, ycs_service_addrs);
                if (tempList) {
                    return tempList.n;
                }

            } else if (code % 100 === 0) {
                tempList = dichotomy(Math.floor(code / 10000) * 10000, 0, ycs_service_addrs.length - 1, ycs_service_addrs);
                if (tempList) {
                    tempList = dichotomy(city, 0, tempList.s.length - 1, tempList.s);
                    if (tempList) {
                        return tempList.n;
                    }
                }

            } else {
                tempList = dichotomy(Math.floor(code / 10000) * 10000, 0, ycs_service_addrs.length - 1, ycs_service_addrs);
                if (tempList) {
                    tempList = dichotomy(city, 0, tempList.s.length - 1, tempList.s);
                    if (tempList) {
                        tempList = dichotomy(code, 0, tempList.s.length - 1, tempList.s);
                        if (tempList) {
                            return tempList.n;
                        }
                    }
                }
            }
            return undefined;
        }
    };
    
    return sersAddrsCtrl;
});