define(['jquery'], function ($) {
    /* ****************************************************
     * position {string | primary} 分页容器
     * amount {number | primary} 页面大小，一页显示多少条数据
     * currentPage： {number | primary} 当前页码
     * data {object | primaray} 接口的入参
     * invoke {function | primaray} 页面变更的回调
     * *****************************************************/
    function Paginate(params) {
        this.prev = null;			  /*上一页按钮*/
        this.next = null;			  /*下一页按钮*/
        this.text = null;
        this.frontE = null;		  /*前省略*/
        this.backE = null;		  /*后省略*/
        this.span = null;			  /*分页主体部分*/
        this.num = [];		          /*页码按钮*/
        this.selectObj = null;
        this.anchorPoint = params.anchorPoint || "";  /*锚点*/
        this.data = params.data;
             /*当前页*/
        this.invoke = params.invoke;    /*回调函数*/
        this.sizes = params.sizes || [];
        this.pages = params.pages * 1;  /*总页数*/
        this.eachAmount = params.amount; /*页面大小*/
        this.currentPage = params.currentPage;  /*当前页*/
        this.position = $(params.position);
        this.createPager();
        //this.pagerInit();

        // console.log(params.pages);
    }


    Paginate.prototype = {
        pagerClick : function (obj) {
            var gotoPage = $(obj).attr('gotoPage');
            if (this.currentPage != gotoPage) {
                this.pagerChange(gotoPage);
            } else {

            }
        },
        
        pagerSelectChange: function () {
            this.pagerChange(1);
        },

        pagerKeyup: function (event) {
            if (event.keyCode == '13') {
                this.pagerSubmit();
            }
        },

        pagerSubmit: function () {
            var value = this.text.val();
            if (/^\d+$/.test(value) && value * 1 > 0 && value * 1 <= this.pages * 1 && value * 1 !== this.currentPage) {
                this.pagerChange(value);
            } else {
                this.text.val('').focus();
            }
        },

        pagerConstruct: function (rest) {
            var i = 0,
                that = this,
                span = this.span,
                num = this.num,
                currentPage = this.currentPage,
                pages = this.pages;
            span.empty();
            currentPage = rest !== undefined ? rest : currentPage * 1;
            this.prev = $('<a ' + (this.anchorPoint ? ('href="#' + this.anchorPoint + '"') : 'href="javascript:;"') + ' class="p-prev-btn' + (currentPage == 1 ? " p-disabled" : "") + '"  gotoPage="' + ((currentPage - 1 < 1) ? 1 : (currentPage - 1)) + '">&lt;</a>').appendTo(span);
            /*分页少于等于9页的情况*/
            if (pages <= 9) {
                for (i = 1; i <= pages; i += 1) {
                    num[i-1] = $('<a ' + (this.anchorPoint ? ('href="#' + this.anchorPoint + '"') : 'href="javascript:;"') + ' class="p-num' + (i == currentPage ? ' p-selected' : '') +'" gotoPage="' + i + '">' + i + '</a>').appendTo(span);
                }
            }else if (pages > 9) {/*分页大于9页的情况*/
                var j = 0;
                for (i = 1; i <= pages; i += 1) {
                    if(i == 3){
                        this.frontE = $('<span class="p-ellipsis">...</span>').appendTo(span);
                        if (currentPage < 6) {
                            this.frontE.hide();
                        }
                    }else if ( i == pages - 1) {
                        this.backE = $('<span class="p-ellipsis">...</span>').appendTo(span);
                        if (currentPage > pages - 5) {
                            this.backE.hide();
                        }
                    }
                    if ((i > 2 && i < pages - 1) && (((i < currentPage - 2 || i> currentPage + 2) && currentPage >= 5 && currentPage <= pages - 4) || (currentPage < 5 && i > 7) ||(currentPage > pages - 4 && i < pages - 6))) {
                        continue;
                    }
                    num[j] = $('<a ' + (this.anchorPoint ? ('href="#' + this.anchorPoint + '"') : 'href="javascript:;"') + ' class="p-num' + (i == currentPage ? ' p-selected' : '') + '" gotoPage="' + i + '">' + i + '</a>').appendTo(span);
                    j++;
                }
            }
            this.next = $('<a class="p-next-btn ' + (currentPage == pages ? "p-disabled" : "") + '" gotoPage="' + ((currentPage + 1 > pages) ? pages : (currentPage + 1)) + '">&gt;</a>').appendTo(span);
            span.delegate('a', 'click', function () {
                that.pagerClick(this);
            });
            /*this.text = $('<input class="pager_input" type="text" />').keyup(function(event){
                that.pagerKeyup(event);
            }).appendTo(span);
            $('<input class="pager_submit" type="button" value="确定" />').click(function(){
                that.pagerSubmit();
            }).appendTo(span);*/
        },
        
        createPager: function () {
            var params = {};
            for (var key in this.data) {
                params[key] = this.data[key];
            }
            params.func = function () {
                arguments[0].pagerInit.call(arguments[0], arguments[3]);
            };
            this.invoke(params);
        },
        
        pagerInit: function (pages) {
            var that = this,
                html = [],
                pager = null;
            $(this.position).empty();
            if(pages*1 <= 1){
                return;
            }
            pager = $('<p class="paginate"></p>');
            this.pages = pages;
            if(this.sizes.length !== 0){
                var selectBox = $('<span class="pager_sizes">每页显示：</span>').appendTo(pager);
                var selectObj = $('<select style="width:64px; z-index:800"></select>').appendTo(selectBox);
                for(var i = 0, length = this.sizes.length; i < length; i++){
                    html.push ('<option value="' + this.sizes[i] + '">' + this.sizes[i] + '</option>');
                }
                $(html.join('')).appendTo(selectObj);

            }
            this.span = $("<span></span>");
            this.pagerConstruct();

            this.span.appendTo(pager);
            pager.appendTo(this.position);
            if(this.sizes.length !== 0){
                selectObj.val(this.eachAmount).change(function(){ that.pagerSelectChange();});
            }
            this.selectObj = selectObj;
        },
        
        pagerChange: function (gotoPage) {
            var params = {};
            
            for(var key in this.data){
                params[key] = this.data[key];
            }
            params.pageNumber = gotoPage;
            params.pageSize = this.eachAmount;
            params.func = function(){
                arguments[0].pagerRebuild.call(arguments[0], arguments[3], arguments[2]);
            };
            this.invoke(params);
        },
        
        pagerRebuild: function (changePage,gotoPage) {
            var i = 0,
                length = 0,
                num = this.num,
                pages = this.pages,
                frontE = this.frontE,
                backE = this.backE,
                prev = this.prev,
                next = this.next;
            
            if(changePage !== this.pages){
                this.pages = changePage;
                this.pagerConstruct(1);
            }
            
            length = num.length;
            for(i = 0; i < length; i += 1){
                if(num[i].hasClass('p-selected')){
                    num[i].removeClass('p-selected');
                    break;
                }
            }
            /*改变页码按钮*/
            /*分页少于等于9页的情况*/
            if(pages <= 9){
                for(i = pages; i--;){
                    if(i+1 == gotoPage){
                        num[i].addClass('p-selected');
                        continue;
                    }
                }
            }else if(pages > 9){ /*分页大于9页的情况*/
                length = num.length;
                if(gotoPage >5&& gotoPage < pages-4){
                    for(i = length; i--;){
                        if(i >= 2 && i <= length-3){
                            if(i == 4){
                                num[i].addClass('p-selected');
                            }
                            num[i].attr('gotoPage', parseInt(gotoPage, 10) + (i - 4));
                            num[i].text(parseInt(gotoPage, 10) + (i - 4));
                        }
                    }
                    frontE.show();
                    backE.show();
                }else if( gotoPage<=5){
                    for(i = length - 2; i--;){
                        num[i].attr('gotoPage', i+1);
                        num[i].text(i+1);
                        if(i+1 == gotoPage){
                            num[i].addClass('p-selected');
                        }
                    }
                    frontE.hide();
                    backE.show();
                }else if (gotoPage >= pages-4){
                    for(i = 2; i<length; i++){
                        num[i].attr('gotoPage',parseInt(pages,10)-(length-(i+1)));
                        num[i].text(parseInt(pages,10)-(length-(i+1)));
                        if(gotoPage == parseInt(pages,10)-(length-(i+1))){
                            num[i].addClass('p-selected');
                        }
                    }
                    frontE.show();
                    backE.hide();
                }

            }
            /*改变其他元素*/

            this.currentPage = gotoPage;
            if(gotoPage == 1){
                prev.addClass('p-disabled');
                prev.attr('gotoPage',1);
            }else{
                prev.removeClass('p-disabled');
                prev.attr('gotoPage',(parseInt(gotoPage,10)-1));
            }
            if(gotoPage == pages){
                next.addClass('p-disabled');
                next.attr('gotoPage',pages);
            }else{
                next.removeClass('p-disabled');
                next.attr('gotoPage',(parseInt(gotoPage,10)+1));
            }
        }
    };
    return Paginate;
});



