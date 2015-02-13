define(function(require, exports, module) {
    var ctable = require('ui/ctable');
    var searchbox = require('ui/searchbox');
    var template = require('./role.html');
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
                if (this.org === treeNode) return;
                this.org = treeNode;
                this.catalog.html(treeNode.name).attr('title', treeNode.name);
                roles.load(treeNode);
            },
            role: null,
            setRole: function(role) {
                if (this.role === role) return;
                this.role = role;
                this.rolename.html(role.name);
                this.roleToggle();
            },
            //两个模块切换可以简单处理，更多模块切换时应约定模块内部定义show(展示初始化)、hide(隐藏)和destroy(销毁)方法
            isUserMode: true, //是否当前在用户界面
            roleToggle: function(b) {
                if (b !== undefined) {
                    this.isUserMode = b;
                }
                if (this.isUserMode) {
                    powers.toggle();
                    users.toggle(1);
                    users.load(this.role);
                } else {
                    users.toggle();
                    powers.toggle(1);
                    powers.load(this.role);
                }
                //布局刷新
                $(window).trigger('resize');
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
                    data: [{
                        label: '用户',
                        on: true
                    }, {
                        label: '权限'
                    }],
                    onselect: function(e, config, data) {
                        _t.roleToggle(data.label == "用户");
                        // debugger;
                    }
                });

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

        //----------role list----------
        var roles = UI({
            el: userManeger.$('.ac-roletable'),
            load: function(treeNode) {
                this.table.load({
                    orgId: treeNode.id
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
                    afterLoad: function(data, cache) {
                        //选中第一个点击
                        this.find('tbody tr').first().trigger('click');
                        roles.roleNum.html(data.result.length);
                    },
                    url: '/json/getRoleByOrgId',
                    baseparams: {}
                });
                this.roleNum = this.$('.ac-role-num');
            }
        });
        //---------- $ role list----------
        
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
                this.seachbox = userManeger.$('.ac-search').searchbox({
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
                        }
                        /*, {
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
                                            }*/
                    ],
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
                    status: function(data) {
                        return '共' + data.total + '人';
                    },
                    template: _.dot('<img src="{{=it.avanta}}" class="xl">\
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
                    itemsOnPage: UI.itemsOnPage,
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            }
        });
        //---------- $ user list ----------

        //---------- powers list 权限模块----------
        var powers = UI({
            el: userManeger.$('.ac-powers'),
            load: function(role) {
                var _powers = this;
                if (!this.loader) {
                    //初始化
                    var id=_.uniqueId('powers'),el=this.el.attr('id',id);
                    var _throttle=_.throttle(function(){
                        if(!document.getElementById(id)){
                            $(window).off('resize',_throttle);
                        }else{
                            var h=$(this).height()-el.offset().top;
                            h&&el.height(h);
                        }
                    });
                    $(window).on('resize',_throttle);
                    _throttle();

                    this.el=this.el.rollbar().find('.rollbar-content');
                    this.loader = UI.loader({
                        url: '/json/getPowers',
                        afterLoad: function(data) {
                            _powers.render(data.result);
                        }
                    });
                }
                this.loader.load({
                    roleId: role.id
                });
            },
            events:{
                'click .ac-check-app':function(){
                    var checked=this.checked;
                    $(this).closest('tbody').find('input').each(function(){
                        this.checked=checked;
                    })
                },
                'click .ac-check-model':function(){
                    var checked=this.checked;
                    $(this).closest('tr').find('.ac-check-fun').each(function(){
                        this.checked=checked;
                    })
                }
            },
            template: _.dot('<form><table class="ctable"><thead><th width="144">应用</th><th width="144">模块</th><th>功能</th>\
            {{~it :app:i}}{{?app.len=app.models.length}}{{?}}<tbody>{{~app.models :model:m}}<tr>\
            {{?!app.used}}<td rowspan="{{=app.len}}"><label class="log xl m5"><input type="checkbox" class="ac-check-app va-tb"> {{=app.used=app.name}}</label></td>{{?}}\
            <td><label class="log xl m5"><input type="checkbox" class="ac-check-model va-tb"> {{=model.name}}</label></td>\
            <td class="p11">{{~model.funs :fun:n}}<label class="xl m5{{?fun.power}} c-safe{{?}}"><input type="checkbox" value="{{=fun.id}}"{{?fun.power}} checked{{?}} class="ac-check-fun va-tb"> {{=fun.name}}</label>{{~}}</td>\
            </tr>{{~}}</tbody>{{~}}</table>\
            <p class="p text-right"><b class="b note ac-save w6 m2"><i class="f f-save"></i>  保存更改</b> <input type="reset" class="b log m4" value="重置"> </p></form>'),
            render: function(data) {
                this.el.html(this.template(data));
            },
            toggle: function(b) {
                this.el.toggle(!!b);
            },
            init: function() {
            }
        });
        //----------$ power list----------
    }
});
