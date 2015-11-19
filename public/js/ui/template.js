define(function(require, exports, module) {
    //可能会用到pager
    var pager = require('ui/pager');
    /**
     * item-head
     * item-body
     * item-foot for pager
     * onSelected
     *   cols:[]
     */
    return function(config) {
        return UI($.extend(true, {
            prefix:_.uniqueId('item'),
            parseData: function(data) {
                return data.data;
            },
            //别名
            alias:{
                page: 'page',  //页码
                count: 'count' //每页条数
            },
            cache: null, //列表数据
            afterLoad: $.noop,
            baseparams: {},
            events: {
                //hover 注意.item-row 前两个空格
                'mouseenter  .item-row': function() {
                    $(this).addClass('item-hover');
                },
                'mouseleave  .item-row': function() {
                    $(this).removeClass('item-hover');
                }
            },
            //获取已选数据
            getSelected: function() {
                var ret = [],
                    cache = this.cache;
                this.body.children('.'+this.prefix+'-selected').each(function() {
                    var index = this.getAttribute('index');
                    if(cache[index]) ret.push(cache[index]);
                });
                return ret;
            },
            //getRowDate
            getRowData: function(dom) {
                var index = $(dom).closest('.item-row').attr('index');
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
                row.html($(conf.templates(conf)).html());
            },
            //模版
            templates: _.dot('{{~it.data :trdata:index}}\
                    <div class="item-row{{?trdata.selected}} item-selected{{?}}" index="{{=index}}">\
                    {{?it.checkbox}}<div class="item-col item-check"><i></i></div>{{?}}\
                    {{~it.cols :col:i}}\
                    <div class="item-col c{{=i}} {{=col.cls||""}}" {{?col.style}}style="{{=col.style}}"{{?}}>{{=trdata[i]===undefined||trdata[i]===null?"":trdata[i]}}</div>\
                    {{~}}\
                    </div>\
                    {{~}}'),
            //loader暴露的接口
            load: function(filter, toBase) {
                if (toBase) {
                    _.extend(this.loader.baseparams, toBase === true ? filter : toBase);
                }
                this.loader.load(filter);
            },
            init: function() {
                var config = this;
                var loader = this.loader = UI.loader({
                    baseparams: config.baseparams,
                    loadtip: config.loadtip,
                    loadtype: config.loadtype,
                    count:config.count,
                    alias:config.alias,
                    url: config.url,
                    beforeLoad: function(filter){
                        config.beforeLoad(filter);
                    },
                    afterLoad: function(data) {
                        var cache = config.cache = config.parseData(data) || [];
                        config.data = config.render(cache);
                        config.el.html(config.templates(config)).children().addClass(config.prefix+'-row');
                        //item 回调
                        config.afterLoad(data, cache);
                    }
                });
            }
        }, config));
    };
});
