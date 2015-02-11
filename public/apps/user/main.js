define(function(require, exports, module) {
    var ctable = require('ui/ctable');
    var searchbox = require('ui/searchbox');
    var template = require('./main.html');
    //滚动条
    require('js/vendor/jquery.mousewheel');
    require('js/vendor/jquery.rollbar');
    //ztree
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    // var url = _.queryString(location.search);
    exports.show = function(opt) {
        // 组织关系依赖enterpriseId
        var enterpriseId = "";
        var orgTreeSetting = {
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
                    userManeger.renderUser(treeNode);
                }
            }
        };
        var userManeger = window.userManager = UI({
            orgTree: null,
            peopleListTable: null,
            catalog: null,
            events: {
                'click .ac-changeDepart': function(e, config) {
                    seajs.use('apps/user/department', function(depart) {
                        depart.show({

                        });
                    })
                }
            },
            makePeopleTree: function() {
                var _t = this;
                $.ajax({
                    url: "/json/getTree",
                    dataType: 'json',
                    success: function(v) {
                        var zNodes = v.result;
                        $.each(zNodes, function(i, o) {
                            o.icon = '../css/img/org-s.png';
                        });
                        var _id = _.uniqueId('orgTree');
                        orgTreeDom = _t.$('.ac-orgtree').attr('id', _id);
                        _t.orgTree = $.fn.zTree.init(orgTreeDom, orgTreeSetting, zNodes);
                        // _t.orgTree.expandAll(true);
                        $('#' + _id + '_1_a').click();
                    }

                });
            },
            //点击左边的树节点，刷出右边的列表
            renderUser: function(treeNode) {
                this.catalog.html(treeNode.name).attr('title', treeNode.name);
                //如果是单位，出现单位功能按钮
                this.peopleListTable.load({
                    orgId: treeNode.id
                });
            },
            //初始化user表格
            makePeopleListTable: function() {
                this.peopleListTable = ctable({
                    container: this.$('.ac-peoples'),
                    cols: [{
                        title: '姓名',
                        width: 70
                    }, {
                        title: '性别',
                        width: 50
                    }, {
                        title: '手机',
                        width: 100
                    }, {
                        title: '邮箱',
                        width: 160
                    }, {
                        title: '部门'
                    }, {
                        title: '角色',
                        width: 100
                    }, {
                        title: '操作',
                        width: 80
                    }],
                    checkbox: true,
                    height: 'window',
                    blankText: '当前部门没有成员',
                    events: {
                        'click .action-person-view': function(event, tr, data, config) {
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
                            debugger;
                            return false;
                        }
                    },
                    //转换 
                    render: function(records) {
                        return $.map(records, function(record, i) {
                            var title = record.loginName;
                            if (record.reserveB && record.idCard) {
                                title += "\n" + _.escape(record.reserveB + ":" + record.idCard);
                            }
                            return [
                                ['<a href="javascript:;" class="action-person-view" title="' + title + '">' + record.userName + '</a>',
                                    record.sex == 0 ? '男' : '女',
                                    record.mobile,
                                    record.email,
                                    record.position,
                                    record.reserveA,
                                    '<a href="javascript:;" class="cpr action-person-freeze">' + (record.userStatus == 1 ? "冻结" : "解冻") + '</a>'
                                ]
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
                if(UI.browser.chrome){
                    this.sidebar.addClass('scroll');
                }else{
                    this.sidebar=this.sidebar.rollbar().find('.rollbar-content');
                }

                this.catalog = this.toolbar.find('.ac-orgname');
                this.makePeopleListTable();
                this.makePeopleTree();
                //切换用户和角色

                /*                buttonset({
                                    el: this.$('.ac-user-role'),
                                    onselect: function(e, config,data) {
                                        if(data.label=="角色"){
                                            //角色下 增加角色列表
                                            //权限下增加权限列表，隐藏人员列表
                                        }else{

                                        }
                                        // debugger;
                                    }
                                });*/
                //search
                //no filter
                this.$('.ac-search').searchbox({
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

            }
        });


    }
});
