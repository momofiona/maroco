define(function(require, exports, module) {
    var ctable = require('ui/table');
    var searchbox = require('ui/searchbox');
    var template = require('./group.html');
    var buttonset = require('ui/buttonset');
    //滚动条
    require('js/vendor/jquery.mousewheel');
    require('ui/rollbar');
    //ztree
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    exports.show = function(opt) {

        //---------- manager----------
        var userManeger = UI({
            events: {
                'click .ac-changeDepart': function(e, config) {

                }
            },
            org: null,
            setOrg: function(treeNode) {
                var _t=this;
                //当前部门不刷新
                if (this.org === treeNode) return;

                this.org = treeNode;
                this.catalog.html(treeNode.name).attr('title', treeNode.name);
                //是否是组织节点
                var isGroup=!treeNode.isParent;
                this.groupMenu.toggle(isGroup);
                this.orgBtn.toggle(!isGroup);
                if(isGroup){
                    this.groupMenu.show().next().hide();
                    users.load(treeNode);
                }else{
                    this.groupMenu.hide().next().show();
                    users.table.loader.afterLoad({
                        total:0
                    });
                }
                this.toolbar.find('.ac-onselect').addClass('hide');
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
                var _t = this;
                this.el.addClass('noscroll am-fadeinright').html(template).appendTo(opt.container);
                this.toolbar = this.$('.toolbar');
                this.sidebar = this.$('.sidebar');
                this.groupMenu = this.$('.ac-whengroup');
                this.orgBtn = this.toolbar.find('.ac-addgroup');
                //给sidebar加上滚动条
                if (UI.browser.chrome) {
                    this.sidebar.addClass('scroll');
                } else {
                    this.sidebar = this.sidebar.rollbar().find('.rollbar-content');
                }

                this.catalog = this.toolbar.find('.ac-orgname');

            }
        });
        //----------$ manager----------

        //----------org tree----------
        var orgTree = UI({
            el: userManeger.el.find('.ac-orgtree').attr('id', _.uniqueId('ztree')),
            settings: {
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
                        //刷出角色树
                        userManeger.setOrg(treeNode);
                    },
                    onAsyncSuccess: function(event, treeId, treeNode, msg) {
                        // 主动打开第一个节点
                        if (!treeNode) {
                            $('#' + treeId + '_1_a').trigger('click');
                        }
                    }
                }
            },
            init: function() {
                this.tree = $.fn.zTree.init(this.el, this.settings);
            }
        });
        //----------$ org tree----------

        //---------- users list 用户模块----------
        var users = UI({
            el: userManeger.$('.ac-peoples'),
            load: function(role) {
                this.table.load({
                    roleId: role.id
                });
            },
            toggle: function(state) {
                state = !!state;
                this.seachbox.toggle(state);
                this.el.toggle(state);
            },
            init: function() {
                var _user = this;
                //search
                this.seachbox = searchbox({
                    el:userManeger.$('.ac-search'),
                    placeholder: '在当部门和角色下查找',
                    value: '',
                    search: function(value, filter) {
                        //回车和点击清空按钮时触发
                    },
                    input: function(value, filter) {
                        //键入内容时触发
                        _user.load({
                            filter: value,
                            roleId: userManeger.role.id
                        });
                    }
                });
                this.table = ctable({
                    container: this.el,
                    cols: [{
                        title: '<a class="ac-addrole xr" href="#" title="添加人员"><i class="f f-add"></i></a>当前角色下人员'
                    }],
                    //每次滚动距离
                    scrollamount: 81,
                    checkbox: true,
                    height: function(grid) {
                        return $(window).height() - $(grid).offset().top;
                    },
                    events: {
                        'click .ac-person-view': function(event, tr, data, config) {
                            //传入一个容器和一个销毁方法
                            seajs.use('apps/user/user', function(user) {
                                user.show({
                                    container: userManeger.openSub(),
                                    data: data,
                                    destroy: function() {
                                        userManeger.closeSub();
                                    }
                                })
                            })
                            return false;
                        },
                        'click .action-person-remove': function(event, tr, data, config) { //查看人员
                            return false;
                        }
                    },
                    status: function(total, page, count) {
                        return '共' + total + '人';
                    },
                    template: _.dot('<img src="{{=it.avanta}}" width="48" height="48" class="xl">\
                        <div style="margin-left:60px">\
                        <div><a href="javascript:;" class="ac-person-view f-lg">{{=it.userName}}</a> <small>({{=it.loginName}})</small></div>\
                        <div class="xr text-right"> {{~it.orgs :v:i}}{{?i>0}}、{{?}}{{=v.orgName}}{{~}}<i class="f f-org m10"></i><br> {{~it.roles :v:i}}{{?i>0}}、{{?}}{{=v.name}}{{~}}<i class="f f-user m10"></i></div>\
                        <div>{{=it.mobile}} <br> {{=it.email}}</div>\
                        </div>'),
                    //转换 
                    render: function(records) {
                        var tmp = this.template;
                        return _.map(records, function(record, i) {
                            return [
                                tmp(record)
                            ];
                        });
                    },
                    onselect: function(selectedData, thisData) {
                        userManeger.toolbar.find('.ac-onselect').toggleClass('hide', !selectedData.length)
                    },
                    count: UI.count,
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            }
        });
        //---------- $ user list ----------
    }
});
