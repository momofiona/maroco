define(function(require, exports, module) {
    var pager = require('ui/pager');
    /**
     * grid-head
     * grid-body
     * grid-foot for pager
     * onSelected
     *   cols:[]
     */
    return function(config) {
        return UI($.extend(true, {
            checkbox: false,
            status: function(total, page, count) {
                return '共 ' + total + ' 条数据';
            },
            parseData: function(data) {
                return data.data;
            },
            //别名
            alias:{
                page: 'page', //页码
                count: 'count', //每页条数
                order:'order',  //排序列
                asc:'asc'       //升序降序
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
            cache: null, //列表数据
            //一些回调
            onSelected: $.noop,
            afterLoad: $.noop,
            baseparams: {},
            events: {
                //hover 注意.grid-row 前两个空格
                'mouseenter  .grid-row': function() {
                    $(this).addClass('grid-hover');
                },
                'mouseleave  .grid-row': function() {
                    $(this).removeClass('grid-hover');
                },
                //选择行
                'click  .grid-row': function(e, config) {
                    var others;
                    if (!e.ctrlKey) {
                        var tar = $(e.target);
                        if (!tar.hasClass('grid-check') && !tar.parent().hasClass('grid-check')) {
                            others = $(this).siblings('.grid-selected').removeClass('grid-selected').length > 0;
                        }
                    }
                    $(this).toggleClass('grid-selected', others || undefined);
                    config.isSelectAll(others ? false : undefined);
                    config.onSelected(config.getSelected());
                },
                //选择行
                'mouseup  .grid-row': function(e, conf) {
                    if (e.which == 3) {
                        if (!$(this).hasClass('grid-selected')) {
                            $(this).addClass('grid-selected').siblings().removeClass('grid-selected');
                            conf.onSelected(conf.getSelected());
                        }
                        //右键菜单
                        if (conf.contextmenu) {
                            conf.contextmenu.render(e.pageX, e.pageY);
                        }
                    }

                },
                //全选
                'click  .grid-check-all': function(e, config) {
                    var parent = $(this).parent().toggleClass('grid-selected'),
                        isAll = parent.hasClass('grid-selected');
                    config.body.children().toggleClass('grid-selected', isAll);
                    config.onSelected(isAll ? config.cache : []);
                },
                //排序 order-asc 升序 order-desc 降序 
                'click  .order': function(e, config) {
                    //优先使用desc排序
                    config.setOrder($(this).attr('order'), $(this).hasClass('desc') ? 'asc' : 'desc');
                }
            },
            //检查是否全选了
            isSelectAll: function(sta) {
                if (sta === undefined) {
                    sta = this.body.children(':not(.grid-selected)').length == 0;
                }
                this.head.toggleClass('grid-selected', sta);
            },
            //检查是否存在滚动条
            isScrolling: function() {
                var b = this.body[0],
                    sw = b.offsetWidth - b.scrollWidth;
                this.head.css('margin-right', sw);
                return sw > 0;
            },
            //获取已选数据
            getSelected: function() {
                var ret = [],
                    cache = this.cache;
                this.body.children('.grid-selected').each(function() {
                    var index = this.getAttribute('index');
                    if(cache[index]) ret.push(cache[index]);
                });
                return ret;
            },
            //getRowDate
            getRowData: function(dom) {
                var index = $(dom).closest('.grid-row').attr('index');
                return this.cache[index];
            },
            //更新当前行
            updateRow: function(row, extend) {
                var conf = this,
                    data = this.cache[row.attr('index')];
                if ($.isFunction(extend)) {
                    extend(data);
                } else if ($.isPlainObject(extend)) {
                    _.extend(data, extend);
                }
                conf.data = conf.render([data]);
                row.html($(conf.templates.items(conf)).html());
            },
            //调整高度以适应窗体
            layout: function() {
                this.body.height((_.isFunction(this.height) ? this.height(this.el) : this.height) - this.head[0].offsetHeight - this.foot.height());
                this.isScrolling();
            },
            //模版
            templates: {
                head: _.dot('<div class="grid-head">\
                    {{?it.checkbox}}<div class="grid-col grid-check grid-check-all"><i></i></div>{{?}}\
                    {{~it.cols :col:i}}\
                    <div class="grid-col c{{=i}} {{=col.cls||""}} {{=col.order?"order":""}}"{{?col.order}} order="{{=col.order}}"{{?}}{{?col.style}} style="{{=col.style}}"{{?}}>{{=col.title||"&nbsp;"}}{{?col.order}} <i class="order-tip"></i>{{?}}</div>\
                    {{~}}\
                    </div>'),
                items: _.dot('{{~it.data :trdata:index}}\
                    <div class="grid-row{{?trdata.selected}} grid-selected{{?}}" index="{{=index}}">\
                    {{?it.checkbox}}<div class="grid-col grid-check"><i></i></div>{{?}}\
                    {{~it.cols :col:i}}\
                    <div class="grid-col c{{=i}} {{=col.cls||""}}" {{?col.style}}style="{{=col.style}}"{{?}}>{{=trdata[i]===undefined||trdata[i]===null?"":trdata[i]}}</div>\
                    {{~}}\
                    </div>\
                    {{~}}')
            },
            //loader暴露的接口
            load: function(filter, toBase) {
                if (toBase) {
                    _.extend(this.loader.baseparams, toBase === true ? filter : toBase);
                }
                this.loader.load(filter);
            },
            init: function() {
                var config = this,
                    uid = _.uniqueId('grid');
                this.el.addClass('grid');
                //head
                this.head = $(this.templates.head(this));
                //body
                this.body = $('<div class="grid-body" id="' + uid + '"></div>');
                //foot
                this.foot = $('<div class="grid-foot"><span class="grid-statu"></span><div class="pager"></div></div>');
                this.statubar = this.foot.find('.grid-statu');
                //loader and pager
                var paging = this.pager = pager({
                    el: this.foot.find('.pager'),
                    onPageClick: function(e, page) {
                        loader.page = page;
                        loader.load();
                    }
                });
                if (!this.count) paging.el.hide();

                var loader = this.loader = UI.loader({
                    baseparams: config.baseparams,
                    loadtip: config.loadtip,
                    loadtype: config.loadtype,
                    alias:config.alias,
                    count: config.count,
                    url: config.url,
                    beforeLoad: function(filter){
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
                        var aData = config.data = config.render(cache),
                            aLen = 0;
                        //处理自动选中
                        if (config.autoSelect) {
                            _.each(cache, function(o, i) {
                                if (config.autoSelect(o)) {
                                    aLen++;
                                    aData[i].selected = true;
                                }
                            });
                            config.autoSelect = null;
                        }
                        config.body.html(config.templates.items(config));
                        //paging
                        if (config.count) {
                            paging.render(data.total, loader.page, loader.count);
                        }
                        //状态
                        config.statubar.html(config.status(data.total, loader.page, loader.count) || '');
                        //去除全选状态
                        config.isSelectAll(aLen !== 0 && aLen === cache.length);
                        //grid 回调
                        config.afterLoad(data, cache);
                        //跳转到第一个默认选中元素
                        //检查滚动条
                        if (config.isScrolling() && aLen) {
                            config.body.children(".grid-selected").get(0).scrollIntoView();
                        }
                        //触发选中回调
                        config.onSelected(config.getSelected());
                    }
                });
                //build
                this.el.empty().append(this.head).append(this.body).append(this.foot);

                //setHeight
                if (config.height) {
                    this.body.addClass('scroll');
                    if (_.isFunction(config.height)) {
                        var _resize = function() {
                                if (!document.getElementById(uid)) {
                                    $(window).off('resize', _resizeDefer);
                                } else {
                                    config.layout();
                                }
                            },
                            _resizeDefer = _.throttle(_resize, 100, {
                                leading: false
                            });
                        $(window).resize(_resizeDefer);
                        _resize();
                    } else {
                        this.layout();
                    }
                }

                //右键菜单
                if (this.contextmenu) {
                    //禁止body右键菜单
                    this.contextmenu = UI(_.defaults({
                        el: $('<div class="dropdown am-fadeup grid-contextmenu">'),
                        render: function(x, y) {
                            //触发menu消失
                            $(document).trigger('click.dropdown');

                            var lis = '',
                                data = this.data = config.getSelected();
                            _.each(this.menus, function(o, i) {
                                if (o === '') {
                                    lis += '<li class="devider"></li>';
                                } else if (!o.test || _.isFunction(o.test) && o.test(data) === true) {
                                    lis += '<li><a' + (o.cls ? ' class="' + o.cls + '"' : '') + ' href="' + (_.isFunction(o.href) ? o.href(data) : o.href || '#') + '">' + o.label + '</a></li>';
                                }
                            });
                            if (lis === "") {
                                this.hide();
                                return;
                            }
                            this.el.html('<ul class="menu dropdown-menu">' + lis + '</ul>').show().appendTo('body').position({
                                at: 'left+' + x + ' top+' + y,
                                my: 'left top',
                                collision: 'flipfit',
                                of: window
                            });
                            if(this.show) this.show();
                        },
                        hide: function() {
                            this.el.detach();
                        },
                        init: function() {
                            this.el.on('hide', function() {
                                $(this).detach();
                            }).add(config.body).on('contextmenu', function(e) {
                                e.preventDefault();
                            });
                        }
                    }, this.contextmenu));
                }

                //框选拖动boxSelect点击拖动5像素以上启动框选
                var box = $('<div class="grid-boxselector">'),
                    //是否相交
                    isCross = function(a, b) {
                        return a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left;
                    },
                    //起点
                    startEvent,
                    //鼠标是否已经点下
                    isMouseDown,
                    //是否已经启动
                    isWorking,
                    doc = $(document),
                    //需要框选的元素集合
                    sheeps,
                    moving = function(e) {
                        if (isMouseDown) {
                            e.preventDefault();
                            var width = e.clientX - startEvent.clientX,
                                height = e.clientY - startEvent.clientY;
                            if (isWorking) {
                                box.css({
                                    width: Math.abs(width),
                                    height: Math.abs(height),
                                    left: startEvent.clientX + (width > 0 ? 0 : width),
                                    top: startEvent.clientY + (height > 0 ? 0 : height)
                                });
                                //选择出在框内的元素
                                var boxRect = box[0].getBoundingClientRect();
                                sheeps.each(function(i, o) {
                                    $(o).toggleClass('grid-selected', isCross(boxRect, o.getBoundingClientRect()));
                                });
                            } else if (Math.abs(width) > 10 || Math.abs(height) > 10) {
                                //当没有数据的时候忽略拖选
                                if (!config.cache.length) return;
                                isWorking = true;
                                box.appendTo('body');
                                sheeps = config.body.children();
                                //如果存在右键菜单，需要删除
                                if(config.contextmenu) config.contextmenu.hide();
                            }
                        }
                    };
                this.body.on('mousedown', function(e) {
                    //该死的火狐没有offsetX
                    var x = e.offsetX,
                        y = e.offsetY;
                    if (!x && !y) {
                        var bcr = this.getBoundingClientRect();
                        x = e.pageX - bcr.left;
                        y = e.pageY - bcr.top;
                    }
                    //左键点击，排除滚动条位置
                    if (e.which == 1 && x < this.clientWidth && y < this.clientHeight) {
                        startEvent = e;
                        isMouseDown = true;
                        doc.on('mousemove', moving).one('mouseup', function() {
                            isMouseDown = startEvent = null;
                            if (isWorking) {
                                sheeps = isWorking = null;
                                box.detach();
                                var sd = config.getSelected();
                                config.onSelected(sd);
                                config.isSelectAll(sd.length === config.cache.length);
                            }
                            doc.off('mousedown', moving);
                        });
                        if (e.target == this) {
                            $(this).children().removeClass('grid-selected');
                            config.onSelected([]);
                            config.isSelectAll(false);
                            //如果存在右键菜单，需要删除
                            if(config.contextmenu) config.contextmenu.hide();
                        }
                    }
                });
                //over
            }
        }, config));
    };
});
