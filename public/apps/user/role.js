define(function(require, exports, module) {
    var ctable = require('ui/ctable');
    var searchbox = require('ui/searchbox');
    var template = require('./role.html');
    var buttonset=require('ui/buttonset');
    //滚动条
    require('js/vendor/jquery.mousewheel');
    require('ui/rollbar');
    //ztree
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    // var url = _.queryString(location.search);
    exports.show = function(opt) {
        // 组织关系依赖enterpriseId
        var enterpriseId = "";
        //整体
        var userManeger = UI({
            events: {
                'click .ac-changeDepart': function(e, config) {
                    
                }
            },
/*            //点击左边的角色列表，刷出右边的列表
            renderUser: function(treeNode) {
                this.rolename.html(treeNode.name).attr('title', treeNode.name);
                //如果是单位，出现单位功能按钮
                this.peopleListTable.load({
                    orgId: treeNode.id
                });
            },
            //点击左边的树节点，刷出右边的角色
            renderRole: function(treeNode) {
                //如果是单位，出现单位功能按钮
                this.RoleListTable.load({
                    orgId: treeNode.id
                });
            },*/
            org:null,
            setOrg:function(treeNode){
                if(this.org===treeNode) return;
                this.org=treeNode;
                this.catalog.html(treeNode.name).attr('title', treeNode.name);
                roles.load(treeNode);
            },
            role:null,
            setRole:function(role){
                if(this.role===role) return;
                this.role=role;
                this.rolename.html(role.name);
                users.load(role);
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
                this.toolbar = this.$('.toolbar');
                this.sidebar = this.$('.sidebar');
                //给sidebar加上滚动条
                if (UI.browser.chrome) {
                    this.sidebar.addClass('scroll');
                } else {
                    this.sidebar = this.sidebar.rollbar().find('.rollbar-content');
                }

                this.catalog = this.toolbar.find('.ac-orgname');
                this.rolename = this.toolbar.find('.ac-rolename');
                //切换用户和角色

                buttonset({
                    el: this.$('.ac-user-role'),
                    data:[{
                        label:'用户',
                        on:true
                    },{
                        label:'权限'
                    }],
                    onselect: function(e, config, data) {
                        if (data.label == "权限") {
                            users.toggle();
                        } else {
                            users.toggle(1);
                            users.load(userManeger.role);
                        }
                        // debugger;
                    }
                });

            }
        });

        //org tree
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
        //role list
        var roles = UI({
            el: userManeger.$('.ac-roletable'),
            load:function(treeNode){
                this.table.load({
                    orgId:treeNode.id
                });
            },
            init: function() {
                this.table = ctable({
                    container: this.el,
                    cols: [{
                        title: '<a class="ac-addrole xr" href="#" title="新增角色"><i class="f f-add"></i></a>角色 (<span class="ac-role-num"></span>)'
                    }],
                    // hidehead:true,
                    checkbox: false,
                    height: 'window',
                    /*status:function(data){
                        if(data.total==0) return '当前部门没有角色';
                    },*/
                    events: {
                        'click tr': function(event, tr, data, config) {
                            tr.addClass('ctable-selected').siblings().removeClass('ctable-selected');
                            userManeger.setRole(data);
                        },
                        'click .ac-roleedit': function(event, tr, data, config) {
                            if (tr.hasClass('ctable-selected')) {
                                event.stopPropagation();
                            }
                            return false;
                        }
                    },
                    //转换 
                    render: function(records) {
                        return $.map(records, function(record, i) {
                            return [
                                ['<a href="#" class="f f-pencil xr ctable-hide ac-roleedit" title="' + _.escape(record.description) + '"></a>' + _.escape(record.name)]
                            ];
                        });
                    },
                    create: function() {
                        this.find('.ac-addrole').click(function() {
                            console.log(this.title);
                        });
                    },
                    afterLoad:function(data,cache){
                        //选中第一个点击
                        this.find('tbody tr').first().trigger('click');
                        roles.roleNum.html(data.result.length);
                    },
                    url: '/json/getRoleByOrgId',
                    baseparams: {}
                });
                this.roleNum=this.$('.ac-role-num');
            }
        });
        //users list
        var users = UI({
            el: userManeger.$('.ac-peoples'),
            load:function(role){
                this.table.load({
                    roleId:role.id
                });
            },
            toggle:function(state){
                this.seachbox.toggle(state);
                this.el.toggle(state);
            },
            init: function() {
                //search
                //no filter
                this.seachbox=userManeger.$('.ac-search').searchbox({
                    placeholder: '在当部门和角色下查找',
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
                this.table = ctable({
                    container: this.el,
                    cols: [{
                        title: '<a class="ac-addrole xr" href="#" title="添加人员"><i class="f f-add"></i></a>当前角色下人员'
                    }/*, {
                        title: '性别',
                        width: 50
                    }, {
                        title: '手机',
                        width: 100
                    }, {
                        title: '邮箱',
                        width: 160
                    }, {
                        title: '<a class="ac-addrole xr" href="#" title="添加人员"><i class="f f-add"></i></a>部门'
                    }*/],
                    checkbox: true,
                    height: 'window',
                    blankText: '当前部门没有成员',
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
                    status:function(data){
                        return '共'+data.total+'人';
                    },
                    template:_.dot('<img src="{{=it.avanta}}" class="xl">\
                        <div style="margin-left:60px">\
                        <div><a href="javascript:;" class="ac-person-view f-lg">{{=it.userName}}</a> <small>({{=it.loginName}})</small></div>\
                        <div class="xr text-right"> {{~it.orgs :v:i}}{{?i>0}}、{{?}}{{=v.orgName}}{{~}}<i class="f f-org m10"></i><br> {{~it.roles :v:i}}{{?i>0}}、{{?}}{{=v.name}}{{~}}<i class="f f-user m10"></i></div>\
                        <div>{{=it.mobile}} <br> {{=it.email}}</div>\
                        </div>'),
                    //转换 
                    render: function(records) {
                        var tmp=this.template;
                        return _.map(records, function(record, i) {
                            return [
                                tmp(record)
/*                                '<img src="'+record.avanta+'" style="display:block">',
                                '<a href="javascript:;" class="action-person-view" title="' + title + '">' + record.userName + '</a>',
                                    record.sex == 0 ? '男' : '女',
                                    record.mobile,
                                    record.email,
                                    record.position*/
                            ];
                        });
                    },
                    onselect: function(selectedData, thisData) {
                        userManeger.toolbar.find('.ac-onselect').toggleClass('hide', !selectedData.length)
                    },
                    itemsOnPage: UI.itemsOnPage,
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            }
        });
        //powers list
        var powers = UI({}, true);


    }
});
