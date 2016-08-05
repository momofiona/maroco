/**
 * 分页
 */
define(function(require, exports, module) {
    var defaults = {
        page: 1,
        total: 1,
        count: 1,
        stone: 100, //里程碑，超过使用精简模式
        edges: 2, //边缘
        displayedPages: 5, //中间个数
        prevText: '&lt;',
        nextText: '&gt;',
        ellipseText: '&hellip;',
        onPageClick: $.noop,
        onInit: $.noop,

        el: null,
        events: {
            'click a': function(e, config) {
                e.preventDefault();
                $(this).addClass('loading');
                config.onPageClick(e, config.page = parseInt(this.getAttribute('page')));
                // return false;
            },
            'change .ac-page': function(e, config) {
                var page = this.value;
                if ($.isNumeric(page) && page > 0) {
                    $(this).addClass('loading');
                    this.disabled = true;
                    config.onPageClick(e, config.page = parseInt(page));
                } else {
                    this.value = config.page;
                }
                // return false;
            }
        },
        link: function(page, currentPage, text, cls, isSpan, nocurrent) {
            cls = cls || "";
            if (page == currentPage && !nocurrent) {
                cls += ' current';
                isSpan = true;
            }
            if (isSpan) return '<span class="' + cls + '">' + (text || page) + '</span>';
            return '<a class="' + cls + '"' + (UI.browser.ie == 6 ? ' href="#"' : '') + ' page="' + page + '">' + (text || page) + '</a>'
        },
        render: function(total, page, count,dataLength) {
            total = parseInt(total);
            var r = '';
            if (!total || this.stone==0) {
                if(total==0){
                    r="";
                }else if(count>0){
                    if(page==1 && dataLength<count){

                    }else{
                        r += this.link(page-1, page, this.prevText, 'prev', page == 1, 1);
                        r += ' &nbsp; 第<input readonly type="text" class="text-center nobd va-t text w' + (page > 99 ? 2 : 1) + ' tiny ac-page" value="' + page + '">页 &nbsp; ';
                        r += this.link(page+1, page, this.nextText, 'next', dataLength < count, 1);
                    }
                }
                return this.el.html(r);
            }
            //page>1 page<totalPage
            page = page ? this.page = page : this.page;
            //count 永远不为0
            count = count ? this.count = count : this.count;
            var totalPage = Math.ceil(total / count);
            if (totalPage == 1) return this.el.empty();

            //如果page超过99，使用精简模式
            if (totalPage >= this.stone) {
                r += this.link(page-1, page, this.prevText, 'prev', page == 1, 1);
                r += ' &nbsp; 第<input type="text" class="text-center nobd va-t text w' + (page > 99 ? 2 : 1) + ' tiny ac-page" value="' + page + '">页 / 共 ' + totalPage + ' 页  &nbsp; ';
                r += this.link(page+1, page, this.nextText, 'next', page == totalPage, 1);
            } else {
                //prev
                r += this.link(page - 1, page, this.prevText, 'prev', page == 1);
                var half = Math.floor(this.displayedPages / 2),
                    start = this.edges + 2,
                    stop = totalPage - this.edges - 1,
                    maxStart = stop - this.displayedPages + 1;
                if (stop - start >= this.displayedPages) {
                    start = Math.max(page - half, start);
                    if (start > maxStart) start = maxStart;
                    stop = start + this.displayedPages - 1;
                }

                for (var i = 1; i <= totalPage; i++) {
                    if (i <= this.edges || i > totalPage - this.edges || (i >= start && i <= stop)) {
                        r += this.link(i, page);
                    } else if (i == this.edges + 1) {
                        if (i == start - 1) {
                            r += this.link(i, page);
                        } else {
                            r += '<span>' + this.ellipseText + '</span>';
                            i = start - 1;
                        }
                    } else if (i == totalPage - this.edges) {
                        if (i == stop + 1) {
                            r += this.link(i, page);
                        } else {
                            r += '<span>' + this.ellipseText + '</span>';
                            i = totalPage - this.edges;
                        }
                    }
                }
                r += this.link(page + 1, page, this.nextText, 'next', page == totalPage);
            }
            this.el.html(r);
        }
    }
    return function(pageConfig) {
        return UI(_.create(defaults, pageConfig));
    }
});
