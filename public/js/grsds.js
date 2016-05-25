(function (requirejs) {
    'use strict'; 
    requirejs(['jquery', 'common', 'formVerified', 'dialog', 'chosen'], function ($, common, FormVerified, dialog) {
    	function IncomeTax () {
    		this.init();
    	}

    	IncomeTax.taxTitle = {
    		"grsds": "个人所得税计算器2016",
    		"shgz": "税后工资计算器 3500元起征点",
    		"nzj": "年终奖个人所得税计算器",
    		"lwbc": "劳务报酬所得税计算器",
    		"gtgsh": "个体工商户生产、经营所得税计算器",
    		"cbcz": "对企事业单位承包承租经营所得个税计算器",
    		"gcsd": "稿酬所得个税计算器",
    		"txq": "特许权使用费所得税计算器",
    		"cczl": "财产租赁所得税计算器",
    		"cczr": "财产转让所得税计算器",
    		"lxhl": "利息、股息、红利所得税计算器",
    		"orsd": "偶然所得税（中彩，中奖税）计算器"
    	};

    	IncomeTax.incomeTile = {
    		"grsds": "税前工资",
    		"shgz": "税后工资",
    		"nzj": "年终奖金",
    		"lwbc": "收入金额",
    		"gtgsh": "收入金额",
    		"cbcz": "收入金额",
    		"gcsd": "收入金额",
    		"txq": "收入金额",
    		"cczl": "收入金额",
    		"cczr": "收入金额",
    		"lxhl": "收入金额",
    		"orsd": "收入金额"
    	};

    	IncomeTax.prototype = {
    		init: function () {
    			var that = this,
    				type = $('#taxType'),
    				verify = new FormVerified(document.getElementById('taxForm'), function () {
    					that.count();
    				}, true);
				type.on('change', function () {
					that.changeForm(this.value);
				});

				this.changeForm(type.val());
    		},

    		resetForm: function () {
    			var form = document.forms.taxForm,
    				income = form.income,
    				insure = form.insure,
    				base = form.base,
    				months = form.months;
    			income.value = "";
    			insure.value = "";
    			base.value = "3500";
    			months.value = "1";
    			$(form).find('.error').hide();
    			$(form).find('input[type="text"]').removeClass('invalid valid');
    		},

    		changeForm: function (type) {
    			var taxTitle = $('#taxTitle'),
    				incomeTitle = $('#incomeTitle'),
    				insureLine = $('#insureLine'),
    				baseLine = $('#baseLine'),
    				monthLine = $('#monthLine');
    			taxTitle.text(IncomeTax.taxTitle[type]);
    			incomeTitle.text(IncomeTax.incomeTile[type]);
    			if (type === "grsds" || type === "shgz") {
    				insureLine.show();
					baseLine.show();
					monthLine.hide();
    			} else if (type === "cbcz") {
    				insureLine.hide();
					baseLine.hide();
					monthLine.show();
    			} else {
    				insureLine.hide();
					baseLine.hide();
					monthLine.hide();
    			}
    			this.resetForm();
    		},

    		count: function () {
    			var form = document.forms.taxForm,
    				type = $('#taxType').val(),
    				income = form.income.value*1,
    				insure = form.insure.value*1,
    				base = form.base.value*1,
    				months = form.months.value*1;
    			this["formula_" + type](income, insure, base, months);
    		},

    		formula_grsds: function (income, insure, base, months) {
    			var taxableIncome = income - insure - base,
    				a = taxableIncome.toFixed(2),
    				r = 0,
    				q = 0,
    				tax = 0,
    				realIncome = 0;
    			if (taxableIncome <= 0) {
    				dialog({
    					content: "您无需缴纳个人所得税"
    				});
    				return;
    			}

    			if (a <= 1500) {
    				r = 0.03;
    				q = 0;
    			}
			    else if (a > 1500 && a <= 4500) {
			    	r = 0.1;
			    	q = 105;
			    }
			    else if (a > 4500 && a <= 9000) {
			    	r = 0.2;
			    	q = 555;
			   	}
			    else if (a > 9000 && a <= 35000) {
			    	r = 0.25;
			    	q = 1005;
			    }
			    else if (a > 35000 && a <= 55000) {
			    	r = 0.3;
			    	q = 2755;
			    }
			    else if (a > 55000 && a <= 80000) {
			    	r = 0.35;
			    	q = 5505;
			    }
			    else {
			    	r = 0.45;
			    	q = 13505;
			    }

			    tax =  taxableIncome * r - q;
			    realIncome = income - insure - tax;

			    this.printResult([{
			    	name: "应纳税所得额",
			    	value: taxableIncome,
			    	unit: "元"
			    },{
			    	name: "适用税率",
			    	value: r*100,
			    	unit: "%"
			    },{
			    	name: "速算扣除数",
			    	value: q,
			    	unit: "元"
			    },{
			    	name: "应缴税款",
			    	value: tax,
			    	unit: "元"
			    },{
			    	name: "实发工资",
			    	value: realIncome,
			    	unit: "元"
			    }]);
    		},

            formula_shgz: function (income, insure, base, months) {
                var taxableIncome = income - base,
                    a = taxableIncome.toFixed(2),
                    r = 0,
                    q = 0,
                    tax = 0,
                    realIncome = 0;
                if (taxableIncome <= 0) {
                    return;
                }

                if (a <= 1500) {
                    r = 0.03;
                    q = 0;
                }
                else if (a > 1500 && a <= 4500) {
                    r = 0.1;
                    q = 105;
                }
                else if (a > 4500 && a <= 9000) {
                    r = 0.2;
                    q = 555;
                }
                else if (a > 9000 && a <= 35000) {
                    r = 0.25;
                    q = 1005;
                }
                else if (a > 35000 && a <= 55000) {
                    r = 0.3;
                    q = 2755;
                }
                else if (a > 55000 && a <= 80000) {
                    r = 0.35;
                    q = 5505;
                }
                else {
                    r = 0.45;
                    q = 13505;
                }

                taxableIncome = (a - q)/(1 - r);
                a = taxableIncome.toFixed(2);

                if (a <= 1500) {
                    r = 0.03;
                    q = 0;
                }
                else if (a > 1500 && a <= 4500) {
                    r = 0.1;
                    q = 105;
                }
                else if (a > 4500 && a <= 9000) {
                    r = 0.2;
                    q = 555;
                }
                else if (a > 9000 && a <= 35000) {
                    r = 0.25;
                    q = 1005;
                }
                else if (a > 35000 && a <= 55000) {
                    r = 0.3;
                    q = 2755;
                }
                else if (a > 55000 && a <= 80000) {
                    r = 0.35;
                    q = 5505;
                }
                else {
                    r = 0.45;
                    q = 13505;
                }

                tax =  a * r - q;
                realIncome = income + insure + tax;

                this.printResult([{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税前工资",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_nzj: function (income, insure, base, months) {
                var a = (income/12).toFixed(2),
                    r = 0,
                    q = 0,
                    tax = 0,
                    realIncome = 0;
                if (income <= 0) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }

                if (a <= 1500) {
                    r = 0.03;
                    q = 0;
                }
                else if (a > 1500 && a <= 4500) {
                    r = 0.1;
                    q = 105;
                }
                else if (a > 4500 && a <= 9000) {
                    r = 0.2;
                    q = 555;
                }
                else if (a > 9000 && a <= 35000) {
                    r = 0.25;
                    q = 1005;
                }
                else if (a > 35000 && a <= 55000) {
                    r = 0.3;
                    q = 2755;
                }
                else if (a > 55000 && a <= 80000) {
                    r = 0.35;
                    q = 5505;
                }
                else {
                    r = 0.45;
                    q = 13505;
                }

                tax =  income * r - q;
                realIncome = income  - tax;

                this.printResult([{
                    name: "平均每月",
                    value: a,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "速算扣除数",
                    value: q,
                    unit: "元"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_lwbc: function (income, insure, base, months) {
                var taxableIncome = 0,
                    r = 0,
                    q = 0,
                    tax = 0,
                    deduct = 0,
                    realIncome = 0;
                if (income < 800) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }
                deduct = 800;
                if (income > 4000) {
                    deduct = income * 0.2;
                }
                taxableIncome = income - deduct;
                r = 0.2;
                q = 0;
                if (taxableIncome > 20000 && taxableIncome <= 50000) {
                    r = 0.3;
                    q = 2000;
                } else if (taxableIncome > 50000) {
                    r = 0.4;
                    q = 7000;
                }

                tax = taxableIncome * r -q;
                realIncome = income - tax;

                this.printResult([{
                    name: "扣除费用",
                    value: deduct,
                    unit: "元"
                },{
                    name: "应纳税所得额",
                    value: taxableIncome,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "速算扣除数",
                    value: q,
                    unit: "元"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_cbcz: function (income, insure, base, months) {
                var a = income - months * 3500,
                    r = 0,
                    q = 0,
                    tax = 0,
                    realIncome = 0;
                if (income <= 0 || a <= 0) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }

                if (a <= 15000) {
                    r = 0.05;
                    q = 0;
                }else if (a > 15000 && a <= 30000) {
                    r = 0.1;
                    q = 750;
                } else if (a > 30000 && a <= 60000) {
                    r = 0.2;
                    q = 3750;
                } else if (a > 60000 && a <= 100000) {
                    r = 0.3;
                    q = 9750;
                } else {
                    r = 0.35;
                    q = 14750;
                }

                tax =  taxableIncome * r - q;
                realIncome = income  - tax;

                this.printResult([{
                    name: "应纳税所得额",
                    value: a,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "速算扣除数",
                    value: q,
                    unit: "元"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_gtgsh: function (income, insure, base, months) {
                var a = income.toFixed(2),
                    r = 0,
                    q = 0,
                    tax = 0,
                    realIncome = 0;
                if (income <= 0) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }

                if (a <= 15000) {
                    r = 0.05;
                    q = 0;
                }else if (a > 15000 && a <= 30000) {
                    r = 0.1;
                    q = 750;
                } else if (a > 30000 && a <= 60000) {
                    r = 0.2;
                    q = 3750;
                } else if (a > 60000 && a <= 100000) {
                    r = 0.3;
                    q = 9750;
                } else {
                    r = 0.35;
                    q = 14750;
                }

                tax =  taxableIncome * r - q;
                realIncome = income  - tax;

                this.printResult([{
                    name: "应纳税所得额",
                    value: a,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "速算扣除数",
                    value: q,
                    unit: "元"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_gcsd: function (income, insure, base, months) {
                var taxableIncome = 0,
                    r = 0.14,
                    tax = 0,
                    deduct = 0,
                    realIncome = 0;
                if (income < 800) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }
                deduct = 800;
                if (income > 4000) {
                    deduct = income * 0.2;
                }
                taxableIncome = income - deduct;

                tax = taxableIncome * r;
                realIncome = income - tax;

                this.printResult([{
                    name: "扣除费用",
                    value: deduct,
                    unit: "元"
                },{
                    name: "应纳税所得额",
                    value: taxableIncome,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_txq: function (income, insure, base, months) {
                var taxableIncome = 0,
                    r = 0.2,
                    tax = 0,
                    deduct = 0,
                    realIncome = 0;
                if (income < 800) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }
                deduct = 800;
                if (income > 4000) {
                    deduct = income * 0.2;
                }
                taxableIncome = income - deduct;

                tax = taxableIncome * r;
                realIncome = income - tax;

                this.printResult([{
                    name: "扣除费用",
                    value: deduct,
                    unit: "元"
                },{
                    name: "应纳税所得额",
                    value: taxableIncome,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_cczl: function (income, insure, base, months) {
                var taxableIncome = 0,
                    r = 0,
                    tax = 0,
                    deduct = 0,
                    realIncome = 0;
                if (income < 800) {
                    dialog({
                        content: "无需缴税"
                    });
                    return;
                }
                deduct = 800;
                if (income > 4000) {
                    deduct = income * 0.2;
                }
                taxableIncome = income - deduct;
                r = 0.2;

                tax = taxableIncome * r;
                realIncome = income - tax;

                this.printResult([{
                    name: "扣除费用",
                    value: deduct,
                    unit: "元"
                },{
                    name: "应纳税所得额",
                    value: taxableIncome,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_cczr: function (income, insure, base, months) {
                var r = 0.2,
                    tax = income * r,
                    realIncome = income - tax;
                this.printResult([{
                    name: "应纳税所得额",
                    value: income,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_lxhl: function (income, insure, base, months) {
                var r = 0.2,
                    tax = income * r,
                    realIncome = income - tax;
                this.printResult([{
                    name: "应纳税所得额",
                    value: income,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },

            formula_orsd: function (income, insure, base, months) {
                var r = 0.2,
                    tax = income * r,
                    realIncome = income - tax;
                this.printResult([{
                    name: "应纳税所得额",
                    value: income,
                    unit: "元"
                },{
                    name: "适用税率",
                    value: r*100,
                    unit: "%"
                },{
                    name: "应缴税款",
                    value: tax,
                    unit: "元"
                },{
                    name: "税后收入",
                    value: realIncome,
                    unit: "元"
                }]);
            },


    		printResult: function (list) {
    			var resultBox = $('#result'),
    				item = null,
    				i = 0,
    				length = list.length,
    				html = [];
    			resultBox.empty();
    			for (i = 0; i < length; i += 1) {
    				item = list[i];
    				html.push('<li>');
                    html.push('<span>');
    				html.push(item.name);
                    html.push('</span>');
    				html.push('<em>');
    				html.push(item.value);
    				html.push('</em>');
    				html.push(item.unit);
    				html.push('</li>');
    			}
    			resultBox.append(html.join(''));
    		}

    	};

    	var incomeTax = new IncomeTax();
    });
}(window.requirejs));