/**
 * 分页
 */
"use strict";
define(function(require, exports, module) {
    var defaults = {
        edges: 2, //边缘
        displayedPages: 5, //中间个数
        prevText: '&lt;',
        nextText: '&gt;',
        ellipseText: '&hellip;',
                onPageClick:$.noop,
        onInit: $.noop
    }
    var pager = function(options,pageConfig) {
        pageConfig = _.proto(defaults, pageConfig);
        //必须带options.count和 options.url
        var loader = UI.loader(options);
        options=loader.config;
        var afterLoad = options.afterLoad;
        options.afterLoad = function(data) {
            this.ui.render(data.total);
            afterLoad && afterLoad.call(this, data);
        }
        options.ui = UI({
            el: pageConfig.el,
            events: {
                'click a': function(event, config) {
                	$(this).addClass('loading');
                    options.page = parseInt(this.getAttribute('page'));
                    pageConfig.onPageClick(options);
                    loader.load();
                }
            },
            link: function(page, currentPage, text, cls, isSpan) {
                cls = cls || "";
                if (page == currentPage) {
                    cls += ' current';
                    isSpan = true;
                }
                if (isSpan) return '<span class="' + cls + '">' + (text || page) + '</span>';
                return '<a class="' + cls + '" href="#" page="' + page + '">' + (text || page) + '</a>'
            },
            render: function(total) {
                if (total == 1) {
                    return this.el.empty();
                }
                var r = '',
                    page = options.page,
                    count = options.count,
                    totalPage = Math.ceil(total / count);
                //prev
                r += this.link(page - 1, page, pageConfig.prevText, 'prev', page == 1);

                var half = Math.floor(pageConfig.displayedPages / 2),
                    start = pageConfig.edges + 2,
                    stop = totalPage - pageConfig.edges - 1,
                    maxStart = stop - pageConfig.displayedPages + 1;
                if (stop - start >= pageConfig.displayedPages) {
                    start = Math.max(page - half, start);
                    if (start > maxStart) start = maxStart;
                    stop = start + pageConfig.displayedPages - 1;
                }

                for (var i = 1; i <= totalPage; i++) {
                    if (i <= pageConfig.edges || i > totalPage - pageConfig.edges || (i >= start && i <= stop)) {
                        r += this.link(i, page);
                    } else if (i == pageConfig.edges + 1) {
                        if (i == start - 1) {
                            r += this.link(i, page);
                        } else {
                            r += '<span>' + pageConfig.ellipseText + '</span>';
                            i = start - 1;
                        }
                    } else if (i == totalPage - pageConfig.edges) {
                        if (i == stop + 1) {
                            r += this.link(i, page);
                        } else {
                            r += '<span>' + pageConfig.ellipseText + '</span>';
                            i = totalPage - pageConfig.edges;
                        }
                    }
                }
                r += this.link(page + 1, page, pageConfig.nextText, 'next', page == totalPage);
                this.el.html(r);
            },
            init: pageConfig.onInit
        });
        return loader;
    }
    module.exports = pager;
});
