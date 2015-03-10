/**
 * 小型grid
 * @param  {Object} config [description]
 * @return {String}      table html
 * config
 *     container        Object  插入点
 *     replaceholder    Object  替换点
 *     hidehead         false   隐藏头部
 *     checkbox         true    是否开启多选
 *     skin             table skin style
 *     addable          增加行提交的处理方法，有此参数时显示添加行按钮，依赖editable
 *     caption          table caption
 *     on               绑定事件
 *     blankText        没有数据时显示的内容
 *     editable         是否允许编辑行列{url,data}
 *         create       新增行之后的回调
 *         post         新增或编辑之后向后端提交的方法；
 *     cols
 *         colgroup     表头分组名
 *         width        Number列宽
 *         background   列背景
 *         title        列标题
 *         editable     编辑的一些属性
 *             fx       计算函数
 *             name     和数据库对应的字段名称，开启编辑输入框
 *             render   自定义编辑框
 *         style       嵌入css
 *         format       TODO 格式化插件 时间格式  金额格式等
 *      render          渲染方法,把后端取得的数据转换成table矩阵
 *      pagingTheme     分页样式 compact-theme light-theme dark-theme
 *      itemsOnPage     每页数量,自动启用分页
 *      url             加载路径
 *      baseparams      需要固定提交的参数
 *      sortable        排序字段
 *      data            一次性写入数据，无法继续使用其他功能，不建议使用此接口，见append接口
 *
 * return {
 *     load(extend)     加载
 *     config           配置
 *     getData(index)   获取数据
 * }
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
            itemsOnPage:10,
            data:[['名称','地址']]
        });
    });
 */
"use strict";
define(function(require, exports, module) {
    require('js/vendor/jquery.mousewheel');
    require('./rollbar');
    //分页
    require('js/vendor/simplePagination');
    var uuid = 0;
    var guid = function(guidPrefix, guidfix) {
        var n = new Date().getTime().toString(32),
            o;
        for (o = 0; o < 5; o++) {
            n += Math.floor(Math.random() * 65535).toString(32);
        }
        return (guidPrefix || "") + n + (uuid++).toString(32) + (guidfix || "");
    }
    var editOver = '<b class="cicon cicon-success" title="保存"></b><b class="cicon cicon-close" title="取消"></b>';
    var addIcon = '<b class="cicon cicon-add" title="增加一行"></b>';
    var inputs = 'input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea, select, input[type="checkbox"],input[type="radio"]';
    var editInput = _.dot('<div class="text-auto-wrap"><input name="{{=it.name}}" value="{{=it.value}}" data-trim="true" data-describedby="tooltip" type="text" class="text-auto" {{=it.attr}}></div>');
    var _colgroup = '{{?it.sortable}}\
            <col width="10">\
        {{?}}\
        {{?it.checkbox}}\
            <col width="34">\
        {{?}}\
        {{~it.cols :col:index}}\
            <col class="{{=col.cls||""}}" width="{{=col.width||""}}" {{?col.background}}style="background:{{=col.background}}"{{?}}>\
        {{~}}\
        {{?it.editable||it.addable||it.removeable}}\
            <col width="80">\
        {{?}}';
    var _thead = '{{?it.caption}}<caption class="ctable-caption">{{=it.caption}}</caption>{{?}}<thead>{{?!it._colgroup}}\
        <tr>\
            {{?it.sortable}}\
            <th></th>\
            {{?}}\
            {{?it.checkbox}}\
            <th align=left><input type="checkbox" class="ctable-checkall"></th>\
            {{?}}\
            {{~it.cols :col:index}}\
            <th align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.sortable?"csortable":""}}" {{?col.sortable}}data-sortable="{{=col.sortable}}"{{?}} {{?col.style}}style="{{=col.style}}"{{?}}>{{=col.title||""}}</th>\
            {{~}}\
            {{?it.editable||it.removeable||it.addable}}\
            <th class="ctable-edge">{{?it.addable}}' + addIcon + '{{??}}操作{{?}}</th>\
            {{?}}\
        </tr>\
        {{??}}\
        <tr>\
            {{?it.sortable}}\
            <th rowspan="2"></th>\
            {{?}}\
            {{?it.checkbox}}\
            <th rowspan="2" align=left><input type="checkbox" class="ctable-checkall"></th>\
            {{?}}\
            {{~it.cols :col:index}}\
                {{?col.colspan}}\
                <th index="{{=index+=col.colspan-1}}" colspan="{{=col.colspan}}" class="ctable-colgroup" align="center">{{=col.colgroup}}</th>\
                {{??}}\
                <th rowspan="2" align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.sortable?"csortable":""}}" {{?col.sortable}}data-sortable="{{=col.sortable}}"{{?}} {{?col.style}}style="{{=col.style}}"{{?}}>{{=col.title||""}}</th>\
                {{?}}\
            {{~}}\
            {{?it.editable||it.removeable||it.addable}}\
            <th rowspan="2" class="ctable-edge">{{?it.addable}}' + addIcon + '{{??}}操作{{?}}</th>\
            {{?}}\
        </tr>\
        <tr>\
            {{~it.cols :col:index}}\
            {{?col.colgroup}}\
            <th align="{{=col.align||"left"}}" class="ctable-colgroup {{=col.cls||""}} {{=col.sortable?"csortable":""}}" {{?col.sortable}}data-sortable="{{=col.sortable}}"{{?}} {{?col.style}}style="{{=col.style}}"{{?}}>{{=col.title||""}}</th>\
            {{?}}\
            {{~}}\
        </tr>\
        {{?}}\
        </thead>';
    var _table = _.dot('<div class="ctable {{=it.skin||""}}" id="{{=it.id||""}}">\
        {{?!it.hidehead}}\
        <div class="ctable-head-wrap"><table class="ctable-head">' + _colgroup + _thead + '</table></div>\
        {{?}}\
        <div class="ctable-body-scroller" id="{{=it.cscrollId}}">\
        <table class="ctable-body">' + _colgroup + '<tbody></tbody></table>\
        </div>\
        {{?it.itemsOnPage||it.status||it.blankText}}\
        <div class="ctable-foot">\
        <div class="ctable-status"></div>\
        <div class="simple-pagination"></div></div>\
        {{?}}\
        </div>');
    /*    var _tableNormal = _.dot('<table class="ctable {{=it.skin||""}}" id="{{=it.id||""}}">' + _colgroup + '{{?!it.hidehead}}' + _thead + '{{?}}\
            <tbody></tbody>\
            {{?it.itemsOnPage}}\
            <tfoot class="ctable-foot"><tr>\
                <td colspan="{{=it.cols.length+it.skipIndex+(it.editable||it.addable||it.removeable?1:0)}}"><span class="ctable-status"></span><div class="simple-pagination"></div></td>\
            </tr></tfoot>\
            {{?}}\
            </table>');*/
    var _tbody = _.dot('{{~it.data :trdata:index}}\
        <tr class="{{=index%2==0?"even":"odd"}}" data-index="{{=trdata.__index__||(it.__appendIndex__||0)+index}}">\
        {{?it.sortable}}\
            <td class="chandler"></td>\
        {{?}}\
        {{?it.checkbox}}\
            <td><input type="checkbox" class="ctable-checkbox"{{?it.checkbox(trdata)}} checked{{?}}></td>\
        {{?}}\
        {{~it.cols :col:colindex}}\
            <td {{?col.align}}align="{{=col.align}}"{{?}} {{?col.cls}}class="{{=col.cls||""}}"{{?}} {{?col.style}}style="{{=col.style}}"{{?}}>{{=trdata[colindex]===undefined||trdata[colindex]===null?"":trdata[colindex]}}</td>\
        {{~}}\
        {{?it.editable||it.removeable||it.addable}}\
            <td class="ctable-edge">{{?trdata.__index__!==undefined&&it.addable.post}}' + editOver + '{{??}}\
            {{?it.editable&&trdata.__index__===undefined}}<b class="cicon cicon-edit" title="编辑"></b>{{?}}\
            {{?it.addable}}' + addIcon + '{{?}}\
            {{?it.removeable}}<b class="cicon cicon-remove" title="删除"></b>{{?}}\
            {{?}}</td>\
        {{?}}\
        </tr>\
        {{~}}');
    var defaults = {
            checked:false,
            sortable:false,
            parseData:function(data){
                return data.result;
            }
        }
        //$.support.boxSizing=false时候所有宽度减去td的padding
    return function(config) {
        config=_.proto(defaults,config);
        var skipIndex = (config.checkbox ? 1 : 0) + (config.sortable ? 1 : 0);
        config.skipIndex = skipIndex;
        config.cscrollId = _.guid('c');
        //预处理表头分组
        config._colgroup = false;
        var _colgroupCache;
        var _fullWidth = 0;
        $.each(config.cols, function(i, o) {
            _fullWidth += o.width;
            if (o.colspan) delete o.colspan;
            if (o.colgroup) {
                if (_colgroupCache && _colgroupCache.colgroup === o.colgroup) {
                    _colgroupCache.colspan = _colgroupCache.colspan ? _colgroupCache.colspan + 1 : 2;
                } else {
                    _colgroupCache = o;
                }
                config._colgroup = true;
            }
        });
        //checkbox参数
        if (config.checkbox && !$.isFunction(config.checkbox)) {
            config.checkbox = $.noop;
        }
        //(config.height || config.maxHeight) ? $(_table(config)) : $(_tableNormal(config))
        var table = $(_table(config)),
            scrollBody = table.find('>.ctable-body-scroller'),
            thead = table.find('thead');
        //IE7 fix - 去掉thead后面多出来的tbody
        if (config.height || config.maxHeight) thead.next().remove();
        var theadContainer = table.find('.ctable-head-wrap'),
            tbody = table.find('tbody'),
            tfoot = table.find('>.ctable-foot'),
            statubar = tfoot.find('.ctable-status'),
            spaging = tfoot.find('.simple-pagination');
        if (config.container) {
            $(config.container).append(table);
        } else if (config.replaceholder) {
            $(config.replaceholder).replaceWith(table);
        }

        thead.on('click', '.csortable', function(e) {
            //排序
            //e.stopPropagation();
            var order = 'asc';
            if ($(this).hasClass('csortable-asc')) {
                $(this).removeClass('csortable-asc').addClass('csortable-desc');
                order = 'desc';
            } else if ($(this).hasClass('csortable-desc')) {
                $(this).removeClass('csortable-desc').addClass('csortable-asc');
            } else {
                $(this).addClass('csortable-asc');
            }
            $(this).siblings().removeClass('csortable-asc').removeClass('csortable-desc');
            $.extend(config.baseparams, {
                orderby: $(this).data('sortable'),
                order: order
            });
            load(filter);
        });
        //排序
        if (config.sortable) {
            tbody.sortable($.extend({
                handle: '.chandler',
                start: function(event, ui) {},
                sort: function() {},
                stop: function() {},
                update: function() {}
            }, config.sortable));
        }
        //多选
        if (config.checkbox) {
            thead.on('click', '.ctable-checkall', function(e) {
                //全选
                e.stopPropagation();
                var ck = this.checked;
                tbody.find('.ctable-checkbox').each(function(i, o) {
                    o.checked = ck;
                });
                table.find('thead').find('.ctable-checkall').each(function() {
                    this.checked = ck;
                });
                if (config.onselect) {
                    config.onselect.call(this, this.checked ? cache : []);
                }
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
                table.find('thead').find('.ctable-checkall')[0].checked = ckall;

                if (config.onselect) {
                    var tr = $(this).closest('tr').attr('data-index');
                    config.onselect.call(this, api.getData('selected'), cache[tr]);
                }
            })
        }
        var generateInputString = function(editconfig, data) {
                if (editconfig && editconfig.name) {
                    if (editconfig.render) {
                        var tmp = editconfig.render(editconfig, editInput, data);
                        if (tmp) return tmp;
                    }
                    var value = data ? data[editconfig.name] : '';
                    value = value === undefined || value === null ? '' : value;
                    return editInput({
                        name: editconfig.name,
                        attr: editconfig.attr || '',
                        value: value
                    })
                }
                return ''
            }
            //是否可编辑
        if (config.editable) {
            tbody.on('click', '.cicon-edit', function(e) {
                if (!$(this).parent().is('.ctable-edge')) return;
                //编辑,搞复杂了，以后改成MVVM
                e.stopPropagation();
                //忽略 checkbox
                var tr = $(this).closest('tr');
                if (config.editable.beforeEdit) {
                    if (config.editable.beforeEdit.call(tr, tbody) === false) return false;
                }
                var data = cache[tr.attr('data-index')];
                var _data = _.proto(data);
                var tds = tr.find('>td');
                //保存模板用于取消编辑
                data.__html__ = tr.html();
                //用于记录修改过的地方
                data.__param__ = _data;
                //换按钮
                $(this).parent().html(editOver).addClass('v-edit');
                //换编辑input
                $.each(config.cols, function(i, o) {
                    var fieldInfo = o.field;
                    //带name的为需要编辑的
                    if (fieldInfo && fieldInfo.name) {
                        var inputString = generateInputString(fieldInfo, data);
                        var input = tds.eq(i + skipIndex).html(inputString);
                    }
                });
                config.editable.create && config.editable.create.call(tr, tr.find(inputs).not('.ctable-checkbox'), _data, fx, config);
            })
        }
        if (config.editable || config.addable) {
            //这里需要处理连续点两次的问题
            tbody.on('click', '.cicon-success', function() {
                if (!$(this).parent().is('.ctable-edge')) return;
                //保存修改
                var tr = $(this).closest('tr');
                var index = tr.attr('data-index');
                var data = cache[index];
                //如果是新增的条目
                if (config.addable && data.__index__ !== undefined) {
                    config.addable.post && config.addable.post.call(tr, data, config);
                    return;
                }
                var _data = data.__param__,
                    param = {};
                for (var i in _data) {
                    if (_data.hasOwnProperty(i)) param[i] = _data[i];
                }
                config.editable.post && config.editable.post.call(tr, param, data, config);

            }).on('click', '.cicon-close', function() {
                if (!$(this).parent().is('.ctable-edge')) return;
                //取消修改
                var tr = $(this).closest('tr');
                var data = cache[tr.attr('data-index')];
                //如果当前tr是新增的
                if (config.addable && $.isNumeric(data.__index__)) {
                    tr.remove();
                    tr = null;
                    config.addable.removed && config.addable.removed.call();
                    return;
                }
                tr.html(data.__html__);
                delete data.__html__;
                delete data.__param__;
            })
        }
        if (config.removeable) {
            tbody.on('click', '.cicon-remove', function() {
                //删除
                var tr = $(this).closest('tr');
                var index = tr.attr('data-index');
                var data = cache[index];
                config.removeable.call(tr, data, config);
            })
        }
        if (config.addable) {
            table.on('click', '.cicon-add', function() {
                //新增一行
                var tr = $(this).closest('tr');
                if (config.addable.beforeAdd) {
                    var nostop = config.addable.beforeAdd.call(tr, tbody);
                    if (nostop === false) return false;
                }
                var _fakeObj = {};
                var fakedata = $.map(config.cols, function(o, i) {
                    return generateInputString(o.field);
                });
                fakedata.__index__ = _fakeObj.__index__ = cache.length;
                config.data = [fakedata];
                if (tr.parent().is('tbody')) {
                    tr = $(_tbody(config)).insertAfter(tr);
                } else {
                    tr = $(_tbody(config)).prependTo(tbody);
                }
                cache[cache.length] = _fakeObj;
                config.addable.create && config.addable.create.call(tr, tr.find(inputs).not('.ctable-checkbox'), _fakeObj, fx, config);
            })
        }
        tbody.on('mouseenter', 'tr', function() {
            $(this).addClass('ctable-hover');
        }).on('mouseleave', 'tr', function() {
            $(this).removeClass('ctable-hover');
        });
        //监控tbody事件
        if (config.events) {
            $.each(config.events, function(k, v) {
                var s = k.indexOf(' ');
                if (s < 2) return;
                tbody.on(k.substr(0, s), k.substr(s + 1), function(event) {
                    var tr = $(this).closest('tr');
                    var index = tr.attr('data-index');
                    var data = cache[index];
                    if (v.call(this, event, tr, data, config) === false) return false;
                });
            })
        }

        //缓存
        var cache = [];
        //筛选
        var filter = {};
        //分页
        //paging.pagination('updateItems', 40)
        //paging.pagination('drawPage', 1)
        var paging;
        //当前页面
        var currentPage = 1;
        //ajax载入数据
        config.baseparams = config.baseparams || {};
        //是否设置了宽高
        if (config.height || config.maxHeight) {
            //TODO support function & '#selector - 100'
            if (config.height === "window") {
                var _throttle = _.throttle(function() {
                    if ($('#' + config.cscrollId).length === 0) {
                        $(window).off('resize', _throttle);
                    } else {
                        height($(window).height() - $(table).offset().top);
                    }
                }, 500, {
                    leading: false
                });
                $(window).on('resize', _throttle);
                _throttle();
            } else if (config.height) {
                height(config.height);
            }
            //是否cols全部设置了宽度
            if (_fullWidth) {
                thead.parent().width(_fullWidth);
                tbody.parent().width(_fullWidth);
            }
            $('#' + config.cscrollId).rollbar({
                scrollamount: config.scrollamount || 100,
                shadow: true,
                onscroll: function(v, h) {
                    if (h !== undefined) {
                        theadContainer[0].scrollLeft = h;
                    }
                }
            });//.find('>.rollbar-content');

        }
        //重新计算长宽

        function height(h) {
                table.height(h);
                if (!config.hidehead) {
                    h -= thead.height();
                }
                if (config.itemsOnPage || config.status || config.blankText) {
                    h -= 30;
                }
                scrollBody.height(h);
            }
            //局部更新
        var update = function(tr, newdata) {
                var index = tr.attr('data-index');
                cache[index] = newdata;
                config.data = config.render([newdata]);
                tr.html($(_tbody(config)).html());
            }
            //局部fx计算
        var fx = function(tr, data) {
            var tds = tr.find('>td');
            $.each(config.cols, function(i, o) {
                var fieldInfo = o.field;
                if (fieldInfo && fieldInfo.fx) {
                    tds.eq(i + skipIndex).html(fieldInfo.fx.call(data));
                }
            })
        }
        var load = function(options) {
            //开启筛选
            if (options) {
                filter = options;
                currentPage = 1;
                paging && paging.pagination('drawPage', currentPage);
            }
            var finalData = $.extend({}, config.baseparams, {
                page: config.itemsOnPage ? currentPage : undefined, //当前页
                count: config.itemsOnPage //每页数量
            }, filter);
            $.ajax({
                url: config.url,
                data: finalData,
                cache: false,
                dataType: 'JSON',
                success: function(data) {
                    cache = config.parseData(data) || [];
                    //如果page不是第一页但是返回数据为0，则自动刷新到前一页
                    if (cache.length === 0 && currentPage > 1) {
                        currentPage--;
                        load();
                        return;
                    }
                    config.data = config.render(cache);
                    var tbodyHtml = _tbody(config);
                    tbody.html(tbodyHtml);
                    if (!config.itemsOnPage || $.isNumeric(data.total) && data.total <= config.itemsOnPage) {
                        spaging.hide()
                    } else {
                        spaging.show()
                        if (!paging) {
                            if (config.itemsOnPage) {
                                paging = spaging.pagination({
                                    items: data.total, //用来计算页数的项目总数 default:1
                                    itemsOnPage: config.itemsOnPage, //每个页面显示的项目数 default:1
                                    displayedPages: config.displayedPages,
                                    edges: config.edges,
                                    cssStyle: 'ctable-theme',
                                    prevText: '&lt;',
                                    nextText: '&gt;',
                                    onPageClick: function(pageNumber, event) {
                                        currentPage = pageNumber;
                                        load();
                                        return false;
                                    }
                                });
                            }
                        } else {
                            paging.pagination('updateItems', data.total);
                        }
                    }
                    //如果返回了总数
                    if (data.total !== undefined || config.status || config.blankText) {
                        var ornot = data.total == 0 && config.blankText ? config.blankText : '共 ' + data.total + ' 项';
                        if (_.isString(config.status)) {
                            config.status = _.dot(sta);
                        }
                        statubar.html(config.status ? config.status(data) : ornot);
                    }
                    config.afterLoad && config.afterLoad.call(table, data, cache);
                }
            });
        }
        config.create && config.create.call(table, config);
        var api = {
            config: config,
            load: load,
            getBody: function() {
                return tbody;
            },
            getData: function(n) {
                if ($.isNumeric(n)) {
                    return cache[n];
                }
                var result = [];
                if (n === "selected") {
                    tbody.find('.ctable-checkbox').each(function(i, o) {
                        if (o.checked) result.push(cache[i]);
                    });
                    return result;
                }
                tbody.children().each(function(i, o) {
                    result.push(cache[$(o).attr('data-index')]);
                });
                return result;
            },
            update: update,
            append: function(datas) {
                if (!(datas instanceof Array)) {
                    datas = [datas];
                }
                config.__appendIndex__ = cache.length;
                //写入cache
                $.each(datas, function(i, data) {
                    cache[cache.length] = data;
                });
                //装入渲染池
                config.data = config.render(datas);
                //生成html
                var tr = $(_tbody(config)).appendTo(tbody);
                delete config.__appendIndex__;
                return tr;
            },
            //清空数据
            reset: function() {
                cache = [];
                tbody.empty();
                debugger;
            }
        }
        return api;
    }
});
