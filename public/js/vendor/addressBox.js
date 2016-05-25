define(["jquery", "addrs", "sersAddrs"], function ($) {
	function AddressBox () {
		this.box = null;
		this.library = [];
		this.closeBtn = null;
		this.provinceBtn = null;
		this.cityBtn = null;
		this.districtBtn = null;
		this.provinceList = null;
		this.cityList = null;
		this.districtList = null;
		this.callback = null;
		this.ctrl = null;
		this.callBack = null;
		this.type = "district";
		this.onChoice = false;
		this.init();
	}

	AddressBox.width = 452;
	AddressBox.lastCtrlId = ""; 

	AddressBox.prototype = {
		init: function () {
			this.initBox();
		},

		initBox: function () {
			var tab = $('<ul class="ui-ab-tab"></ul>');
			var content = $('<div class="ui-ab-content"></div>');
			this.closeBtn = $('<a href="javascript:;" class="ui-ab-closeBtn">×</a>');
			this.provinceBtn = $('<li>请选择</li>');
			this.cityBtn = $('<li>请选择</li>');
			this.districtBtn = $('<li>请选择</li>');
			this.provinceList = $('<ul></ul>');
			this.cityList = $('<ul></ul>');
			this.districtList = $('<ul></ul>');
			this.box = $('<div class="ui-addrBox" id="ui-addrBox"></div>');
			tab.append(this.provinceBtn).append(this.cityBtn).append(this.districtBtn).appendTo(this.box);
			content.append(this.provinceList).append(this.cityList).append(this.districtList).appendTo(this.box);
			this.closeBtn.appendTo(this.box);
			this.box.appendTo('body');
			this.listener();
		},

		listener: function () {
			var that = this;
			this.closeBtn.on('click', function () {
				that.close();
			});
			this.provinceList.on('click', 'li', function () {
				var btn = $(this),
					value = btn.attr('data-value');
				btn.addClass('active').siblings('li').removeClass('active');
				that.provinceBtn.text(btn.text()).attr('title', btn.text()).attr('data-value', value);
				if (that.type === "province") {
					that.close();
					that.ctrl.attr('data-value', value);
					that.printAddr();
				} else {
					that.onChoice = true;
					that.packageList("city", value*1, 0, 0);
					that.districtBtn.text("请选择").attr('title', "请选择").attr('data-value', 0);
					that.cityBtn.trigger('click');
				}
			});

			this.cityList.on('click', 'li', function () {
				var btn = $(this),
					provinceCode = that.provinceBtn.attr('data-value'),
					value = btn.attr('data-value');
				btn.addClass('active').siblings('li').removeClass('active');
				that.cityBtn.text(btn.text()).attr('title', btn.text()).attr('data-value', value);
				if (that.type === "city") {
					that.close();
					that.ctrl.attr('data-value', (provinceCode + "," + value));
					that.printAddr();
				} else {
					that.onChoice = true;
					that.packageList("district", provinceCode*1, value*1, 0);
					that.districtBtn.trigger('click');
				}
			});

			this.districtList.on('click', 'li', function () {
				var btn = $(this),
					provinceCode = that.provinceBtn.attr('data-value'),
					cityCode = that.cityBtn.attr('data-value'),
					value = btn.attr('data-value');
				btn.addClass('active').siblings('li').removeClass('active');
				that.districtBtn.text(btn.text()).attr('title', btn.text()).attr('data-value', value);
				that.close();
				that.ctrl.attr('data-value', (provinceCode + "," + cityCode + "," + value));
				that.printAddr();
			
			});

			this.provinceBtn.on('click', function () {
				$(this).addClass('active').siblings('li').removeClass('active');
				that.provinceList.show();
				that.cityList.hide();
				that.districtList.hide();
			});

			this.cityBtn.on('click', function () {
				$(this).addClass('active').siblings('li').removeClass('active');
				that.provinceList.hide();
				that.cityList.show();
				that.districtList.hide();
			});

			this.districtBtn.on('click', function () {
				$(this).addClass('active').siblings('li').removeClass('active');
				that.provinceList.hide();
				that.cityList.hide();
				that.districtList.show();
			});

			this.box.on('mouseleave', function () {
				setTimeout(function () {
					if (!that.onChoice) {
						that.box.hide();
					}
				}, 50);
			});
		},

		printAddr: function () {
			var format = this.ctrl.attr('data-format') || "pcd",
				p = this.provinceBtn.text() !== "请选择" ? this.provinceBtn.text() : '',
				c = this.cityBtn.text() !== "请选择" ?  this.cityBtn.text() : '',
				d = this.districtBtn.text() !== "请选择" ?  this.districtBtn.text() : '';
				if (format.indexOf('p') !== -1) {
					format = format.replace('p', p);
				}
				if (format.indexOf('c') !== -1) {
					format = format.replace('c', c);
				}
				if (format.indexOf('d') !== -1) {
					format = format.replace('d', d);
				}
				$('#' + this.ctrl.attr('data-target')).text(format);
			if (typeof this.callback === 'function') {
				this.callback();
			}
		},
		show: function (obj, callback) {
			this.ctrl = $(obj);
			var offset = this.ctrl.offset(),
				ctrlWidth = this.ctrl.outerWidth(true),
				winWidth = $(window).width(),
				height = this.ctrl.outerHeight(true),
				values = this.ctrl.attr('data-value').split(','),
				provinceCode = values[0]*1 || 0,
				cityCode = values[1]*1 || 0,
				districtCode = values[2]*1 || 0,
				top = offset.top,
				left = offset.left;
			this.callback = callback;
			if (AddressBox.lastCtrlId === obj.id) {
				this.box.show();
				return;
			} else {
				AddressBox.lastCtrlId = obj.id;
			}
			this.type = this.ctrl.attr('data-type') || 'district';
			if (this.ctrl.attr('data-library') === 'address') {
				this.library = ycs_sys_addrs;
			} else if (this.ctrl.attr('data-library') === 'service') {
				this.library = ycs_service_addrs;
			} else {
				this.library = $.parseJSON(this.ctrl.attr('data-library'));
			}

			if (left + AddressBox.width > winWidth) {
				left = left - AddressBox.width + ctrlWidth;
			}

			this.packageBox(provinceCode, cityCode, districtCode);
			this.box.css({
				top: top + height,
				left: left
			}).show();
			this.onChoice = false;
		},

		resetBtn: function (type) {
			this.districtBtn.hide().removeClass('active');
			this.cityBtn.hide().removeClass('active');
			this.provinceBtn.hide().removeClass('active');
			if (type === "province") {
				this.provinceBtn.show().addClass('active');
			} else if (type === "city") {
				this.provinceBtn.show();
				this.cityBtn.show().addClass('active');
			} else if (type === "district") {
				this.provinceBtn.show();
				this.cityBtn.show();
				this.districtBtn.show().addClass('active');
			}
		},

		chosen: function (list) {
			if (list === this.type) {

			}
		},

		resetBox: function () {
			this.provinceBtn.removeClass('active');
			this.cityBtn.removeClass('active');
			this.districtBtn.removeClass('active');
			this.provinceList.hide();
			this.cityList.hide();
			this.districtList.hide();
		},

		packageBox: function (provinceCode, cityCode, districtCode) {
			var showList = "province";
			this.packageList('province', provinceCode, cityCode, districtCode);
			this.resetBox();
			if (this.type === "city" || this.type === "district") {
				if (provinceCode) {
					this.packageList('city', provinceCode, cityCode, districtCode);
				}
				if (this.type === "district") {
					if (provinceCode && cityCode) {
						this.packageList('district', provinceCode, cityCode, districtCode);
					}
				}
			}
			if (districtCode){
				this.resetBtn("district");
			}else if (cityCode){
				this.resetBtn("city");
			} else {
				this.resetBtn("province");
			}
			if (this.type === "city") {
				showList = "city";
				if (cityCode === 0 && provinceCode === 0) {
					showList = "province";
				}
			}

			if (this.type === "district") {
				showList = "district";
				if (cityCode === 0 && districtCode === 0) {
					showList = "city";
					if (provinceCode === 0) {
						showList = "province";
					}
				}
			}
			this[showList + "List"].show();
			this[showList + "Btn"].addClass('active');
		},

		packageList: function (type, provinceCode, cityCode, districtCode) {
			var items = [],
				html = [],
				i = 0,
				code = 0,
				longFlag = false,
				length = 0;
			
			if (type === "province") {
				code = provinceCode;
			} else if (type === "city") {
				code = cityCode;
			} else if (type === "district") {
				code = districtCode;
			}

			this.resetBtn(type);
			this[type + "Btn"].text("请选择").attr('title', "请选择").attr('data-value', "0");

			items = this.qryPlace(type, provinceCode, cityCode);
			for (i = 0, length = items.length; i < length; i += 1) {
				longFlag = false;
				if (items[i].name.length > 5) {
					longFlag = true;
				}
				if (items[i].code === code) {
					html.push('<li class="active' + (longFlag ? ' ui-ab-longarea': '') + '" data-value="' + items[i].code + '">');
					this[type + "Btn"].text(items[i].name).attr('title', items[i].name).attr('data-value', items[i].code);
				} else {
					html.push('<li' + (longFlag ? ' class="ui-ab-longarea"': '') + ' data-value="' + items[i].code + '">');
				}
				html.push(items[i].name);
				html.push('</li>');
			}
			this[type + "List"].empty();
			this[type + "List"].append(html.join(''));
		},

		qryPlace: function (type, provinceCode, cityCode) {
			var i = 0,
				j = 0,
				k = 0,
				iLen = this.library.length,
				jLen = 0,
				kLen = 0,
				result = [];
			if (type === "province") {
				for (i = 0; i < iLen; i += 1) {
                    result.push({
                        code: this.library[i].c,
                        name: this.library[i].n
                    });
                }
			}

			if (type === "city") {
				for (i = 0; i < iLen; i += 1) {
                    if (provinceCode !== this.library[i].c) {
                        continue;
                    }
                    for (j = 0, jLen = this.library[i].s.length; j < jLen; j += 1) {
                        result.push({
                            code: this.library[i].s[j].c,
                            name: this.library[i].s[j].n
                        });
                    }
                }
			}

			if (type === 'district') {
				for (i = 0; i < iLen; i += 1) {
                    if (provinceCode !== this.library[i].c) {
                        continue;
                    }
                    for (j = 0, jLen = this.library[i].s.length; j < jLen; j += 1) {
                        if (cityCode !== this.library[i].s[j].c) {
                            continue;
                        }
                        for (k = 0, kLen =  this.library[i].s[j].s.length; k < kLen; k += 1) {
                            result.push({
                                code: this.library[i].s[j].s[k].c,
                                name: this.library[i].s[j].s[k].n
                            });
                        }
                    }
                }
			}

			return result;
		},

		close: function () {
			this.box.hide();
		}
	};

	return new AddressBox();	
});