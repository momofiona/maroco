/**
 * 小型grid
 * @param  {Object} config [description]
 * config
 *     container        Object  插入点
 *     hidehead         false   隐藏头部
 *     checkbox         true    是否开启多选
 *     alias            设置参数别名
 *     skin             table skin style
 *     events           绑定事件
 *     editable         是否允许编辑行列,整理中...
 *         create       新增行之后的回调
 *         post         新增或编辑之后向后端提交的方法；
 *         remove       
 *     cols
 *         colgroup     表头分组名
 *         width        Number列宽
 *         background   列背景
 *         title        列标题
 *         style        嵌入td中的css
 *      parseData       对ajax返回的数据预处理
 *      render          渲染方法,把后端取得的数据转换成table矩阵
 *      count           每页数量,自动启用分页
 *      url             加载路径
 *      baseparams      需要固定提交的参数
 *      sortable        开启行拖动排序
 *
 * @example
 *      ctable({
            cols:[{
                title:'客户名称',
                width:120,
                background:"#39f",
                style:'color:#fff'
            }, {
                title:'客户地址'

            }],
            count:10,
            data:[['名称','地址']]
        });
    });
 */
define(function(require, exports, module) {
    "use strict";
    require('mousewheel');
    require('ui/rollbar');
    //分页
    var pager = require('ui/pager');
    // var editOver = '<b class="i i-safe ac-tr-save m2" title="保存"></b><b class="i i-close ac-tr-cancel" title="取消"></b>';
    // var inputs = 'input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea, select, input[type="checkbox"],input[type="radio"]';
    // var editInput = _.dot('<div class="text-auto-wrap"><input name="{{=it.name}}" value="{{=it.value}}" data-trim="true" data-describedby="tooltip" type="text" class="text-auto" {{=it.attr}}></div>');
    var _colgroup = '{{?it.sortable}}<col width="10">{{?}}\
        {{?it.checkbox}}<col width="34">{{?}}\
        {{~it.cols :col:index}}<col class="{{=col.cls||""}}" width="{{=col.width||""}}" {{?col.background}}style="background:{{=col.background}}"{{?}}>{{~}}';
    var _thead = '<thead>{{?!it._colgroup}}\
        <tr>\
            {{?it.sortable}}<th class="chandler"></th>{{?}}\
            {{?it.checkbox}}<th align=left><input type="checkbox" class="ctable-checkall"></th>{{?}}\
            {{~it.cols :col:index}}\
            <th align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
            {{~}}\
        </tr>\
        {{??}}\
        <tr>\
            {{?it.sortable}}<th class="chandler" rowspan="2"></th>{{?}}\
            {{?it.checkbox}}<th rowspan="2" align=left><input type="checkbox" class="ctable-checkall"></th>{{?}}\
            {{~it.cols :col:index}}\
                {{?col.colspan}}\
                <th index="{{=index+=col.colspan-1}}" colspan="{{=col.colspan}}" class="ctable-colgroup" align="center">{{=col.colgroup}}</th>\
                {{??}}\
                <th rowspan="2" align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
                {{?}}\
            {{~}}\
        </tr>\
        <tr>\
            {{~it.cols :col:index}}{{?col.colgroup}}\
            <th align="{{=col.align||"left"}}" class="ctable-colgroup {{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
            {{?}}{{~}}\
        </tr>\
        {{?}}</thead>';
    var _table = _.dot('<div class="ctable {{=it.skin||""}}" id="{{=it.id}}">\
        {{?!it.hidehead}}<div class="ctable-head"><table>' + _colgroup + _thead + '</table></div>{{?}}\
        <div class="ctable-body" id="{{=it.id}}_body"><table>' + _colgroup + '<tbody></tbody></table></div>\
        {{?!it.hidefoot}}<div class="ctable-foot"><div class="ctable-status"></div>{{?it.count}}<div class="pager"></div>{{?}}</div>{{?}}\
        </div>');
    var _tbody = _.dot('{{~it.data :trdata:index}}\
        <tr class="{{=index%2==0?"even":"odd"}}" data-index="{{=(it.__appendIndex__||0)+index}}">\
        {{?it.sortable}}<td class="chandler"></td>{{?}}\
        {{?it.checkbox}}<td><input type="checkbox" class="ctable-checkbox" value="{{=(it.__appendIndex__||0)+index}}"></td>{{?}}\
        {{~it.cols :col:colindex}}\
            <td{{?col.align}} align="{{=col.align}}"{{?}}{{?col.cls}} class="{{=col.cls}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=trdata[colindex]}}</td>\
        {{~}}</tr>{{~}}');
    var defaults = {
        //开启行选择
        checkbox: false,
        //开启排序
        sortable: false,
        //隐藏头尾
        hidehead: false,
        hidefoot: false,
        //别名
        alias: {
            page: 'page', //页码
            count: 'count', //每页条数
            order: 'order', //排序列
            asc: 'asc' //升序降序
        },
        /**
         * 设置列表排序
         * @param  {String} order [colFieldName]
         * @param  {String} asc   [asc|desc]
         */
        setOrder: function(order, asc) {
            //去除其余列图标,找出需要排序的那列
            var orderCol = this.head.find('.order').removeClass('asc desc').filter('[order=' + order + ']');
            if (orderCol.length) {
                this.baseparams[this.alias.order] = order;
                this.baseparams[this.alias.asc] = asc;
                orderCol.addClass(asc === 'asc' ? 'asc' : 'asc desc');
                this.loader.load();
            }
        },
        getOrder: function() {
            return {
                order: this.baseparams[this.alias.order],
                asc: this.baseparams[this.alias.asc]
            };
        },
        //状态栏
        status: function(total, page, count) {
            return '共 ' + total + ' 条数据';
        },
        //数据策略
        parseData: function(data) {
            //这里需要确定data.total
            return data.data;
        },
        //数据加载入口
        load: function(filter, toBase) {
            if (toBase) {
                _.extend(this.loader.baseparams, toBase === true ? filter : toBase);
            }
            this.loader.load(filter);
        },
        /**
         * 获取数据
         * @return {[type]} [description]
         */
        getSelected: function() {
            var data = [],
                cache = this.cache;
            this.tbody.find('.ctable-checkbox').each(function(i, o) {
                if (o.checked) {
                    data.push(cache[o.value]);
                };
            });
            return data;
        },
        /**
         * 获取某行数据
         * @param  {jQueryElement} tr [tr节点]
         * @return {Object}    [某行的数据]
         */
        getRowData: function(tr) {
            return this.cache[tr.attr('data-index')];
        },
        /**
         * 添加数据
         * @param  {Array} datas [description]
         * @return {[type]}       [description]
         */
        append: function(datas) {
            if (!datas.length) return;
            //已经存在的数量
            this.__appendIndex__ = this.cache.length;
            //写入cache
            this.cache = this.cache.concat(datas);
            //装入渲染池造数据矩阵
            this.data = this.render(datas);
            //生成html
            var tr = $(_tbody(this)).appendTo(this.tbody);
            delete this.__appendIndex__;
            //去除全选
            if (this.checkall) {
                this.checkall.checked = false;
            }
            return tr;
        },
        //更新行
        updateRow: function(tr, newdata) {
            var data = this.getRowData(tr);
            $.extend(data, newdata);
            this.data = this.render([data]);
            tr.html($(_tbody(this)).html());
        },
        create: $.noop, //刚创建时
        onselect: $.noop, //勾选动作时
        onscroll: $.noop, //滚动内容时
        beforeLoad: $.noop,
        afterLoad: $.noop,
        //确保baseparams有内存地址，并且不允许重定义baseparams更改地址，不如会影响下面loader参数
        baseparams: {},
        //数据列缓存
        cache: []
    };
    //$.support.boxSizing=false时候所有宽度减去td的padding
    return function(config) {
        config = $.extend(true, {}, defaults, config);
        //动态ID
        config.id = config.id || _.uniqueId("ctable");

        //预处理表头分组
        config._colgroup = false;
        var _colgroupCache, _fullWidth = 0;
        $.each(config.cols, function(i, o) {
            // IE67校准宽度,去掉padding的宽度
            if (_.isNumber(o.width) && UI.browser.ie < 8) {
                o.width -= 16;
            }
            //计算整体宽度
            _fullWidth += o.width;
            //排除外来影响
            if (o.colspan) delete o.colspan;
            if (o.colgroup) {
                //如果前面有列和本列有相同的colgroup值
                if (_colgroupCache && _colgroupCache.colgroup === o.colgroup) {
                    _colgroupCache.colspan = _colgroupCache.colspan ? _colgroupCache.colspan + 1 : 2;
                } else {
                    _colgroupCache = o;
                }
                config._colgroup = true;
            }
        });


        //mark doms
        var table = config.table = $(_table(config)),
            head = config.head = table.find('>.ctable-head'),
            body = config.body = table.find('>.ctable-body'),
            foot = config.foot = table.find('>.ctable-foot'),

            thead = config.thead = head.find('thead'),
            tbody = config.tbody = body.find('tbody'),

            statubar = config.statubar = foot.find('.ctable-status'),
            pagebar = config.pagebar = foot.find('.pager'),
            checkall = config.checkall = thead.find('.ctable-checkall')[0];
        $(config.container).append(table);

        //排序
        thead.on('click', '.order', function(e) {
            //优先使用desc排序
            config.setOrder($(this).attr('order'), $(this).hasClass('desc') ? 'asc' : 'desc');

        });
        //拖动排序
        if (config.sortable) {
            require.async('sortable', function() {
                tbody.sortable($.extend({
                    handle: '.chandler',
                    start: $.noop,
                    sort: $.noop,
                    stop: $.noop,
                    update: $.noop
                }, config.sortable));
            });
        }
        //多选
        if (config.checkbox) {
            $(checkall).on('click', function(e) {
                //全选
                e.stopPropagation();
                var ck = this.checked;
                tbody.find('.ctable-checkbox').each(function(i, o) {
                    o.checked = ck;
                });
                config.onselect.call(this, this.checked ? config.cache : []);
            });
            tbody.on('click', '.ctable-checkbox', function(e) {
                //全选
                e.stopPropagation();
                var ckall = true;
                tbody.find('.ctable-checkbox').each(function(i, o) {
                    if (!o.checked) {
                        ckall = false;
                        return false;
                    }
                });
                checkall.checked = ckall;
                config.onselect.call(this, config.getSelected(), config.cache[this.value]);
            });
        }
        //row hover effect
        tbody.on('mouseenter', 'tr', function() {
            $(this).addClass('ctable-hover');
        }).on('mouseleave', 'tr', function() {
            $(this).removeClass('ctable-hover');
        });
        //监控tbody事件
        if (config.events) {
            $.each(config.events, function(k, v) {
                k = $.trim(k);
                var s = k.indexOf(' ');
                if (s < 2) return;
                tbody.on(k.substr(0, s), k.substr(s + 1), function(event, obj) {
                    //这是为了两个table mouseenter同步的时候不继续触发回调
                    if (obj && obj.silent) return;
                    var tr = $(this).closest('tr');
                    v.call(this, event, tr, config.getRowData(tr), config);
                });
            });
        }

        //是否设置了宽高
        if (config.height) {
            //TODO support function & '#selector - 100'
            if (_.isFunction(config.height)) {
                var _throttle = _.throttle(function() {
                    if (document.getElementById(config.id)) {
                        height(config.height(table));
                    } else {
                        $(window).off('resize', _throttle);
                    }
                }, 500, {
                    leading: false
                });
                $(window).on('resize', _throttle);
                height(config.height(table));
            } else if (config.height) {
                height(config.height);
            }
            //是否cols全部设置了宽度
            if (_fullWidth) {
                thead.parent().width(_fullWidth);
                tbody.parent().width(_fullWidth);
            }
            $('#' + config.id + '_body').rollbar({
                scrollamount: config.scrollamount || 100,
                shadow: true,
                onscroll: function(v, h) {
                    if (h !== undefined) {
                        head[0].scrollLeft = h;
                    }
                    config.onscroll(v, h);
                }
            });
        }
        //重新计算长宽
        function height(h) {
            table.height(h);
            if (!config.hidehead) {
                h -= thead.height();
            }
            if (!config.hidefoot) {
                h -= 30;
            }
            body.height(h);
        }

        //loader and pager
        var paging = pager({
            el: pagebar,
            onPageClick: function(e, page) {
                loader.page = page;
                loader.load();
            }
        });
        if (!config.count) pagebar.hide();
        var loader = config.loader = UI.loader({
            baseparams: config.baseparams,
            alias: config.alias,
            loadtip: config.loadtip,
            count: config.count,
            url: config.url,
            beforeLoad: function(filter) {
                config.beforeLoad(filter);
            },
            afterLoad: function(data) {

                var cache = config.cache = config.parseData(data) || [];
                //如果page不是第一页但是返回数据为0，则自动刷新到前一页
                if (cache.length === 0 && this.page > 1) {
                    this.page = this.page - 1;
                    this.load();
                    return;
                }
                config.data = config.render(cache);
                var tbodyHtml = _tbody(config);

                //去除全选
                if (checkall) {
                    checkall.checked = false;
                }
                //延时插入，否则IE10、IE11页面元素无法选中，select无法点出菜单
                setTimeout(function() {
                    tbody.html(tbodyHtml);
                    config.afterLoad(data, cache);
                }, 20);
                //paging
                if (config.count) {
                    paging.render(data.total, loader.page, loader.count);
                }
                //如果返回了总数
                statubar.html(config.status(data.total, loader.page, loader.count));
            }
        });

        config.create();
        return config;
    };
});
