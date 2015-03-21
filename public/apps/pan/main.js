//我的文档
define(function(require, exports, module) {

    var template = require('./main.html'),
        grid = require('ui/grid'),
        FILE = require('apps/pan/file'),
        buttonset = require('ui/buttonset'),
        searchbox = require('ui/searchbox');

    exports.show = function(opt) {
        var HTML = $(template),
            tools = HTML.find('.ac-tools');
        opt.container.html(HTML);

        //列表视图和缩略图视图切换
        buttonset({
            cls: 'link',
            el: HTML.find('.ac-listorthumb'),
            data: [{
                label: '<i class="f f-menus"></i> 列表',
                title: '列表查看',
                cls: 'b-cute',
                on: true //开启状态
            }, {
                thumb: true,
                label: '<i class="f f-grid"></i> 大图标',
                title: '大图标查看',
                cls: 'b-cute'
            }],
            onselect: function(e, config, data) {
                HTML.toggleClass('thumb-view', !!data.thumb);
                //校准文件列表高度
                fileList.layout();
            },
            create: function() {
                this.el.css('margin', '0 10px 0 0');
            }
        });

        //搜索框
        HTML.find('.ac-search').searchbox({
            placeholder: '搜索我的文件',
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

        //排序、文件名、大小、日期,点击事件请各个模块自行绑定到dropdown上自行实现
        var sortableSwitch = UI({
            el: HTML.find('.ac-sortableswitch'),
            events: {
                'mouseenter': function(e, config) {
                    $(this).find('.dropdown').show();
                },
                'mouseleave': function(e, config) {
                    $(this).find('.dropdown').hide();
                },
                'click a': function(e, config) {
                    //判断点击的fileName是否和当前一样，如果一样，切换order，如果不一样 切换fileName 重置order
                    var orderby = $(this).attr('orderby');
                    if (orderby == config.orderby) {
                        config.order = config.order == 'desc' ? 'asc' : 'desc';
                    } else {
                        config.orderby = orderby;
                        config.order = 'asc';
                    }
                    config.render();
                    config.onclick();
                }
            },
            map: null,
            orderby: null,
            order: 'asc', //默认
            onclick: null,
            render: function() {
                var s = "",
                    orderby = this.orderby,
                    cur = '<a href="#" orderby="' + this.orderby + '"><i class="f f-' + (this.order == 'desc' ? 'down' : 'up') + '" style="margin-right:5px;"></i>' + this.map[orderby] + '</a>';
                _.each(this.map, function(v, k) {
                    if (k == orderby) return;
                    s += '<li><a href="#" orderby="' + k + '"><i class="f f-up"></i>' + v + '</a></li>';
                });
                this.el.html(cur + '<div class="dropdown text-left" style="top:0px;left:10px;"><ul class="menu orderby"><li>' + cur + '</li>' + s + '</ul></div>').find('>a').css('color', '#454647');
            },
            //重置内容
            reset: function(conf) {
                //必须覆盖 map orderby order 3个参数以及传出回调onclick
                $.extend(this, conf);
                this.render();
            },
            create: function() {}
        });

        //上传,异步加载
        require.async(['ui/upload', 'ui/notify'], function(upload, notify) {
            var btn=HTML.find('.ac-upload')[0];
            upload({
                browse_button: btn,
                container: btn.parentNode,
                url: '/upload',
                FilesAdded: function(up, files) {
                    $.each(files, function(i, o) {
                        o.url = '/upload'; //可为每个批上传设置不同的上传路径
                    })
                },
                BeforeUpload: function(up, file) {
                    up.settings.url = file.url; //配合FilesAdded 更改上传路径
                },
                FileUploaded: function(up, file, data) {

                },
                //上传结束后
                UploadComplete: function(up, files) {
                    notify.safe('上传完毕');
                    fileList.load();
                }
            });
        });

        //我的文档列表
        var fileList = grid({
            el: HTML.find('.ac-tabcon'),
            checkbox: true,
            cols: [{
                title: '文件名',
                orderby: 'fileName',
                cls: 'grid-name'
            }, {
                title: '大小',
                cls: 'grid-size',
                orderby: 'size'
            }, {
                title: '修改日期',
                cls: 'grid-date',
                orderby: 'date'
            }],
            url: '/json/members',
            count: 10,
            height: function(grid) {
                return $(window).height() - $(grid).offset().top;
            },
            render: function(data) {
                var cls;
                return _.map(data, function(o, i) {
                    cls = FILE.getFileIcon({
                        fileName: o.cname
                    });
                    return [
                        '<i class="fcon fcon_' + cls + '"'+(cls=='jpg'?' url="'+o.path+'"':'')+'></i>' + '<span class="filename">' + o.cname + '</span>',
                        o.size,
                        o.sendtime
                    ];
                });
            },
            //UI()保留方法 只在初始化(init)结束后执行一次
            create: function() {
                var t = this,
                    baseparams = t.loader.baseparams;
                //清空前面模块的遗留，根据orderby和order决定内部html
                sortableSwitch.reset({
                    map: {
                        fileName: '文件名',
                        size: '大小',
                        date: '修改日期'
                    },
                    orderby: baseparams.orderby || 'fileName',
                    order: baseparams.order,
                    onclick: function() {
                        //更改grid排序
                        t.resetOrder(this);
                    }
                });
            },
            //点表头排序的回调函数
            onOrderChange: function() {
                sortableSwitch.reset({
                    orderby: this.baseparams.orderby,
                    order: this.baseparams.order
                });
            },
            //当有数据选中的时候
            onSelected: function(data) {
                tools.find('.ac-sel-show').toggleClass('vhide', data.length == 0);
            }
        });

        //tabs
        UI.tabs({
            el: HTML.find('.tabs'),
            caption: HTML.find('.caption'),
            onActive: function(tab, panel) {
                var s=''
                for(var i in tab) s+=i+'\t';
                //面包屑栏目
                this.caption.html('<i class="f f-home"></i>&nbsp;' + tab.innerHTML);
                //刷新文件列表
                fileList.load();
            }
        });
    }
});