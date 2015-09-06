/**
 * 分页
 */
define(function(require, exports, module) {
    var defaults = {
        page: 1,
        total: 1,
        count: 1,
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
            }
        },
        link: function(page, currentPage, text, cls, isSpan) {
            cls = cls || "";
            if (page == currentPage) {
                cls += ' current';
                isSpan = true;
            }
            if (isSpan) return '<span class="' + cls + '">' + (text || page) + '</span>';
            return '<a class="' + cls + '"'+(UI.browser.ie==6?' href="#"':'')+' page="' + page + '">' + (text || page) + '</a>'
        },
        render: function(total, page, count) {
            total = parseInt(total);
            if (!total) {
                return this.el.empty();
            }
            //page>1 page<totalPage
            page = page ? this.page = page : this.page;
            //count 永远不为0
            count = count ? this.count = count : this.count;
            var r = '',
                totalPage = Math.ceil(total / count);
            if (totalPage == 1) return this.el.empty();
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
            this.el.html(r);
        }
    }
    return function(pageConfig) {
        return UI(_.create(defaults, pageConfig));
    }
});
