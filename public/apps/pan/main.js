define(function(require, exports, module) {
    var template = require('./main.html'),
        grid = require('ui/grid'),
        file = require('apps/pan/file'),
        buttonset = require('ui/buttonset'),
        searchbox = require('ui/searchbox');

    exports.show = function(opt) {
        var HTML = $(template);
        opt.container.html(HTML);

        //列表视图和缩略图视图切换
        buttonset({
            cls: 'link',
            el: HTML.find('.ac-listorthumb'),
            data: [{
                label: '<i class="f f-menus"></i> 列表',
                title: '列表查看',
                cls:'b-cute',
                on: true //开启状态
            }, {
                thumb: true,
                label: '<i class="f f-grid"></i> 大图标',
                title: '大图标查看',
                cls:'b-cute'
            }],
            onselect: function(e, config, data) {
                HTML.toggleClass('thumb-view', !!data.thumb);
                //校准文件列表高度
                fileList.layout();
            },
            create:function(){
                this.el.css('margin','5px 10px 0 0');
            }
        });
        //搜索框
        HTML.find('.ac-search').searchbox({
            placeholder: '在当前部门下查找',
            value: '',
            search: function(value, filter) {
                //回车和点击清空按钮时触发
                console.log(value, filter)
            },
            input: function(value, filter) {
                //键入内容时触发
                console.log(value, filter)
            }
        });
        //面包屑导航
        var guider = UI({
            el: HTML.find('.ac-guider'),
            events: {},

            init: function() {

            }
        });

        //我的文档列表
        var fileList = grid({
            el: HTML.find('.ac-tabcon'),
            checkbox: true,
            cols: [{
                cls: 'grid-fcon'
            }, {
                title: '文件名',
                orderby: 'fileName',
                cls: 'grid-name'
            }, {
                title: '大小',
                cls:'grid-size xr m2',
                orderby: 'size'
            }],
            url: '/json/members',
            count: 10,
            height: function(grid) {
                return $(window).height() - $(grid).offset().top;
            },
            render: function(data) {
                return _.map(data, function(o, i) {
                    return [
                        '<i class="fcon ' + file.getFileIcon({
                            fileName: o.cname
                        }) + '"></i>',
                        o.cname,
                        o.sendtime
                    ];
                });
            }
        });

        //tabs
        UI.tabs({
            el: HTML.find('.tabs'),
            caption: HTML.find('.caption'),
            onActive: function(tab, panel) {
                //面包屑栏目
                this.caption.html('<i class="f f-home"></i>&nbsp;' + tab.text);
                //刷新文件列表
                fileList.load();
            }
        });
    }
});
