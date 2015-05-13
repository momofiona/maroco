define(function(require, exports, module) {
    var ctable = require('ui/table'),
        searchbox = require('ui/searchbox'),
        template = require('./resource.html'),
        notify = require('ui/notify');
    //滚动条
    require('js/vendor/jquery.mousewheel');
    require('ui/rollbar');
    //ztree
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    exports.show = function(opt) {
        var ResourceTreeSetting = {
            async: {
                url: '/json/getTree',
                enable: true,
                autoParam: ["id"],
                dataFilter: function(treeId, parentNode, responseData) {
                    return responseData.result;
                },
                dataType: 'json',
                type: 'get'
            },
            view: {
                selectedMulti: false
            },
            callback: {
                onClick: function(event, treeId, treeNode) {
                    powerManeger.renderPower(treeNode);
                },
                onAsyncSuccess: function(event, treeId, treeNode, msg) {
                    // 主动打开第一个节点
                    if (!treeNode) {
                        $('#' + treeId + '_1_a').trigger('click');
                    }
                }
            }
        };
        var powerManeger = UI({
            restree: null,
            resourcePowerTable: null,
            catalog: null,
            events: {
                //新建应用
                'click .ac-add-app': function(e, conf) {
                    conf.createAppMenuPage('app');
                },
                //新建菜单
                'click .ac-add-menu': function(e, conf) {
                    conf.createAppMenuPage('menu');
                },
                //新建页面
                'click .ac-add-page': function(e, conf) {
                    conf.createAppMenuPage('page');
                },
                //新建子页面
                'click .ac-add-subpage': function(e, conf) {
                    conf.createAppMenuPage('subpage');
                },

                //编辑资源
                'click .ac-edit': function(e, conf) {
                    console.log('.ac-edit');
                },
                //删除当前资源
                'click .ac-del': function(e, conf) {
                    console.log('.ac-del');
                    notify.confirm({
                        msg: '确定删除？',
                        callback: function(b) {
                            if (b) {
                                //删除
                                notify.safe('删除成功');
                                //干掉树节点
                            }
                        }
                    })
                },

                //新建资源保存
                'click .ac-new-save': function(e, conf) {
                    console.log('.ac-new-save', conf.curtype, conf.resource);
                },
                //新建资源取消
                'click .ac-new-cancel': function(e, conf) {
                    console.log('.ac-new-cancel');
                    conf.createAppMenuPageCancel();
                },


                //新建操作
                'click .ac-power-add': function(e, config) {
                    console.log('.ac-del')
                },
                //删除操作
                'click .ac-power-del': function(e, config) {
                    console.log('.ac-del')
                }

            },

            //点击左边的树节点，刷出右边的列表
            resource: null,
            renderPower: function(treeNode) {
                if (this.resource == treeNode) return;
                //隐藏主要按钮
                this.mainMenu.hide();
                this.createBtns.hide().next().show();
                var type = '应用';
                //如果当前是应用 应用、菜单  填充模版
                //如果当前是菜单 应用、页面
                //如果当前是页面 应用、子页面
                //如果当前是子页面 应用、子页面
                if (1) {
                    //应用
                    this.btnAddMenu.show();
                    this.curtype = 'app';
                } else if (2) {
                    type = '菜单';
                    this.btnAddPage.show();
                    this.curtype = 'menu';
                } else if (3) {
                    type = '页面';
                    this.btnAddSubpage.show();
                    this.curtype = 'page';
                } else if (4) {
                    type = '子页面';
                    this.btnAddSubpage.show();
                    this.curtype = 'subpage';
                }
                this.infoEl.html(this.temp[this.curtype](treeNode));
                this.resource = treeNode;
                this.catalog.html(treeNode.name + ' (' + type + ')');
                //刷新人员列表
                this.resourcePowerTable.load({
                    orgId: treeNode.id
                });
            },
            //初始化权限列表
            makeResourcePowerTable: function() {
                this.resourcePowerTable = ctable({
                    container: this.$('.ac-powers'),
                    cols: [{
                        title: '名称',
                        width: 100
                    }, {
                        title: '代码',
                        width: 100
                    }, {
                        title: '链接',
                        width: 160
                    }, {
                        title: '授权角色'
                    }, {
                        title: '操作',
                        align: 'center',
                        width: 50
                    }],
                    checkbox: true,
                    events: {
                        //操作编辑
                        'click .ac-power-edit': function(event, tr, data, config) {
                            //传入一个容器和一个销毁方法
                            console.log('.ac-power-edit');
                            return false;
                        }
                    },
                    //转换 
                    render: function(records) {
                        return $.map(records, function(record, i) {
                            return [
                                [
                                    record.userName,
                                    record.loginName,
                                    record.mobile,
                                    record.email,
                                    '<a href="javascript:;" title="编辑" class="ac-power-edit"><i class="f f-pencil"></i></a>'
                                ]
                            ];
                        });
                    },
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            },
            //新建应用、菜单、子页面
            createAppMenuPage: function(type) {
                this.createBtns.show().next().hide();
                this.infoEl.html(this.temp[type]({
                    name: ''
                }));
            },
            //新建应用、菜单、子页面
            createAppMenuPageCancel: function() {
                this.createBtns.hide().next().show();
                this.infoEl.html(this.temp[this.curtype](this.resource));
            },
            //打开子页面
            openSub: function() {
                this.el.hide();
                return this.subEl = $('<div class="am-fadeinright scroll"></div>').insertAfter(this.el);
            },
            closeSub: function() {
                if (this.subEl) {
                    this.subEl.remove();
                    this.el.show();
                    this.subEl = null;
                }
            },
            init: function() {
                this.el.addClass('noscroll am-fadeinright').html(template).appendTo(opt.container);
                this.sidebar = this.$('.sidebar');
                //新建应用按钮
                // this.btnAddApp=this.$('.ac-add-app').hide();
                //新建菜单按钮
                this.btnAddMenu = this.$('.ac-add-menu').hide();
                //新建页面按钮
                this.btnAddPage = this.$('.ac-add-page').hide();
                //新建子页面按钮
                this.btnAddSubpage = this.$('.ac-add-subpage').hide();
                this.mainMenu = this.btnAddMenu.add(this.btnAddPage).add(this.btnAddSubpage);

                //新建保存和取消按钮
                this.createSaveBtn = this.$('.ac-new-save');
                this.createBtns = this.createSaveBtn.parent();
                this.createCancelBtn = this.$('.ac-new-cancel');

                //模版们
                this.infoEl = this.$('.ac-info');
                var temp = this.temp = {};
                temp['app'] = _.dot(this.$('.ac-temp-app').html());
                temp['menu'] = _.dot(this.$('.ac-temp-menu').html());
                temp['page'] = _.dot(this.$('.ac-add-page').html());
                temp['subpage'] = _.dot(this.$('.ac-add-subpage').html());
                //给sidebar加上滚动条
                if (UI.browser.chrome) {
                    this.sidebar.addClass('scroll');
                } else {
                    this.sidebar = this.sidebar.rollbar().find('.rollbar-content');
                }

                this.catalog = this.$('.ac-head');
                this.makeResourcePowerTable();
                //初始化资源树
                this.restree = $.fn.zTree.init(this.$('.ac-restree').attr('id', _.uniqueId('restree')), ResourceTreeSetting);

            }
        });


    }
});
