/**
 * 小型grid
 * @param  {Object} config [description]
 * @return {String}      table html
 * config
 *     container        Object  插入点
 *     hidehead         false   隐藏头部
 *     checkbox         true    是否开启多选
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
 * return {
 *     load(extend)     加载
 *     config           配置
 *     getData(index)   获取数据
 *     update
 *     append
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
            count:10,
            data:[['名称','地址']]
        });
    });
 */
"use strict";
define(function(require, exports, module) {
    require('js/vendor/jquery.mousewheel');
    require('ui/rollbar');
    //分页
    var pager = require('ui/pager');
    var editOver = '<b class="i i-safe ac-tr-save m2" title="保存"></b><b class="i i-close ac-tr-cancel" title="取消"></b>';
    // var addIcon = '';
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
        {{?it.editable}}\
            <col width="80">\
        {{?}}';
    var _thead = '<thead>{{?!it._colgroup}}\
        <tr>\
            {{?it.sortable}}\
            <th class="chandler"></th>\
            {{?}}\
            {{?it.checkbox}}\
            <th align=left><input type="checkbox" class="ctable-checkall"></th>\
            {{?}}\
            {{~it.cols :col:index}}\
            <th align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
            {{~}}\
            {{?it.editable}}\
            <th class="text-center"><b class="f f-add ac-tr-add"></b></th>\
            {{?}}\
        </tr>\
        {{??}}\
        <tr>\
            {{?it.sortable}}\
            <th class="chandler" rowspan="2"></th>\
            {{?}}\
            {{?it.checkbox}}\
            <th rowspan="2" align=left><input type="checkbox" class="ctable-checkall"></th>\
            {{?}}\
            {{~it.cols :col:index}}\
                {{?col.colspan}}\
                <th index="{{=index+=col.colspan-1}}" colspan="{{=col.colspan}}" class="ctable-colgroup" align="center">{{=col.colgroup}}</th>\
                {{??}}\
                <th rowspan="2" align="{{=col.align||"left"}}" class="{{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
                {{?}}\
            {{~}}\
            {{?it.editable}}\
            <th rowspan="2" class="text-center"><b class="f f-add ac-tr-add"></b></th>\
            {{?}}\
        </tr>\
        <tr>\
            {{~it.cols :col:index}}\
            {{?col.colgroup}}\
            <th align="{{=col.align||"left"}}" class="ctable-colgroup {{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||""}}{{?col.order}} <i class="order-tip"></i>{{?}}</th>\
            {{?}}\
            {{~}}\
        </tr>\
        {{?}}\
        </thead>';
    var _table = _.dot('<div class="ctable {{=it.skin||""}}" id="{{=it.id||""}}">\
        {{?!it.hidehead}}\
        <div class="ctable-head"><table>' + _colgroup + _thead + '</table></div>\
        {{?}}\
        <div class="ctable-body" id="{{=it.cscrollId}}">\
        <table>' + _colgroup + '<tbody></tbody></table>\
        </div>\
        {{?it.count}}\
        <div class="ctable-foot">\
        <div class="ctable-status"></div>\
        <div class="pager"></div></div>\
        {{?}}\
        </div>');
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
        {{?it.editable}}\
            <td class="p0 text-center">{{?trdata.__index__!==undefined}}' + editOver + '{{??}}\
            <b class="f f-pencil ac-tr-edit c-note m2 ctable-hide" title="编辑"></b>\
            <b class="f f-bin ac-tr-remove c-error ctable-hide" title="删除"></b>\
            {{?}}</td>\
        {{?}}\
        </tr>\
        {{~}}');
    var defaults = {
            checked: false,
            sortable: false,
            status: function(total, page, count) {
                return '共 ' + total + ' 条数据';
            },
            parseData: function(data) {
                    return data.result;
                }
                /*,
                            render:function(result){
                                var cols=this.cols;
                                return _.map(result,function(v,k){
                                    return _.map(cols,function(o,i){
                                        return _.isFunction(o.html)?o.html(v,k,i):v[o.html];
                                    });
                                });
                            }*/
        }
        //$.support.boxSizing=false时候所有宽度减去td的padding
    return function(config) {
        config = _.extend({}, defaults, config, {
            skipIndex: (config.checkbox ? 1 : 0) + (config.sortable ? 1 : 0),
            cscrollId: _.guid('c')
        });
        var skipIndex = config.skipIndex;
        //预处理表头分组
        config._colgroup = false;
        var _colgroupCache;
        var _fullWidth = 0;
        $.each(config.cols, function(i, o) {
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

        //checkbox参数
        if (config.checkbox && !$.isFunction(config.checkbox)) {
            config.checkbox = $.noop;
        }
        //(config.height || config.maxHeight) ? $(_table(config)) : $(_tableNormal(config))
        var table = $(_table(config)),
            scrollBody = table.find('>.ctable-body'),
            theadContainer = table.find('>.ctable-head'),
            thead = theadContainer.find('thead'),
            tbody = scrollBody.find('tbody'),
            tfoot = table.find('>.ctable-foot'),
            statubar = tfoot.find('.ctable-status'),
            spaging = tfoot.find('.pager');
        $(config.container).append(table);

        thead.on('click', '.order', function(e) {
            //排序
            e.stopPropagation();
            var asc = 'asc',t=$(this);
        	if(t.hasClass('desc')){
        		t.removeClass('desc');
        	}else if(t.hasClass('asc')){
        		asc='desc';
        		t.addClass('desc');
        	}else{
        		t.addClass('asc');
        	}
        	//去除其余列图标
        	t.siblings().removeClass('asc desc');
        	_.extend(config.baseparams,{
        		order:t.attr('order'),
        		asc:asc
        	});
            loader.load();
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
        var _editable = config.editable;
        if (_editable) {
            _.defaults(_editable, {
                beforeAdd: $.noop,
                beforeEdit: $.noop,
                create: $.noop,
                post: $.noop,
                remove: $.noop
            });
            thead.on('click', '.ac-tr-add', function() {
                //新增一行
                if (_editable.beforeAdd.call(table) === false) return false;
                var _fakeObj = {};
                var fakedata = $.map(config.cols, function(o, i) {
                    return generateInputString(o.field);
                });
                fakedata.__index__ = _fakeObj.__index__ = cache.length;
                cache[fakedata.__index__] = _fakeObj;
                config.data = [fakedata];
                var tr = $(_tbody(config)).prependTo(tbody);
                _editable.create.call(tr, _fakeObj, config);
            });
            tbody.on('click', '.ac-tr-edit', function(e) {
                //判断是否是
                //编辑,搞复杂了，以后改成MVVM
                e.stopPropagation();
                //忽略 checkbox
                var tr = $(this).closest('tr'),
                    data = cache[tr.attr('data-index')];
                if (_editable.beforeEdit.call(tr, data) === false) return false;
                var _data = _.proto(data),
                    tds = tr.find('>td');
                //保存模板用于取消编辑
                data.__html__ = tr.html();
                //用于记录修改过的地方
                data.__param__ = _data;
                //换按钮
                $(this).parent().html(editOver);
                //换编辑input
                $.each(config.cols, function(i, o) {
                    var fieldInfo = o.field;
                    //带name的为需要编辑的
                    if (fieldInfo && fieldInfo.name) {
                        var inputString = generateInputString(fieldInfo, data);
                        var input = tds.eq(i + skipIndex).html(inputString);
                    }
                });
                _editable.create.call(tr, _data, config);
            }).on('click', '.ac-tr-save', function() {
                //保存修改
                var tr = $(this).closest('tr');
                var index = tr.attr('data-index');
                var data = cache[index];
                _editable.post.call(tr, data, config);

            }).on('click', '.ac-tr-cancel', function() {
                //取消修改
                var tr = $(this).closest('tr');
                var data = cache[tr.attr('data-index')];
                //如果当前tr是新增的
                if ($.isNumeric(data.__index__)) {
                    tr.remove();
                    return;
                }
                tr.html(data.__html__);
                delete data.__html__;
                delete data.__param__;
            }).on('click', '.ac-tr-remove', function() {
                //删除
                var tr = $(this).closest('tr');
                var index = tr.attr('data-index');
                var data = cache[index];
                config.remove.call(tr, data, config);
            });
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
        //是否设置了宽高
        if (config.height) {
            //TODO support function & '#selector - 100'
            if (_.isFunction(config.height)) {
                var _throttle = _.throttle(function() {
                    if (!document.getElementById(config.cscrollId)) {
                        $(window).off('resize', _throttle);
                    } else {
                        height(config.height(table));
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
            }); //.find('>.rollbar-content');

        }
        //重新计算长宽

        function height(h) {
                table.height(h);
                if (!config.hidehead) {
                    h -= thead.height();
                }
                if (config.count) {
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
            /*            //局部fx计算
                    var fx = function(tr, data) {
                            var tds = tr.find('>td');
                            $.each(config.cols, function(i, o) {
                                var fieldInfo = o.field;
                                if (fieldInfo && fieldInfo.fx) {
                                    tds.eq(i + skipIndex).html(fieldInfo.fx.call(data));
                                }
                            });
                        }*/
            //loader and pager
        var paging = pager({
            el: spaging,
            onPageClick: function(e, page) {
                loader.page = page;
                loader.load();
            }
        });
        if (!config.count) spaging.hide();
        var loader = UI.loader({
            baseparams: config.baseparams,
            count: config.count,
            url: config.url,
            cache: config.cache,
            afterLoad: function(data) {
                cache = config.parseData(data) || [];
                //如果page不是第一页但是返回数据为0，则自动刷新到前一页
                if (cache.length === 0 && this.page > 1) {
                    this.page = this.page - 1;
                    this.load();
                    return;
                }
                config.data = config.render(cache);
                var tbodyHtml = _tbody(config);
                tbody.html(tbodyHtml);
                //paging
                if (config.count) {
                    paging.render(data.total, loader.page, loader.count);
                }
                //如果返回了总数
                statubar.html(config.status(data.total, loader.page, loader.count) || '');
                config.afterLoad && config.afterLoad.call(table, data, cache);
            }
        });


        config.create && config.create.call(table, config);
        var api = {
            config: config,
            load: function(filter) {
                loader.load(filter);
            },
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
                statubar.empty();
                paging.render(0);
            }
        }
        return api;
    }
});
