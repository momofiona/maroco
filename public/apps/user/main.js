define(function(require, exports, module) {
    var ctable = require('ui/table');
    var searchbox = require('ui/searchbox');
    var template = require('./main.html');
    //滚动条
    require('js/vendor/jquery.mousewheel');
    require('ui/rollbar');
    //ztree
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    exports.show = function(opt) {
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
                },
                onAsyncSuccess: function(event, treeId, treeNode, msg) {
                    // 主动打开第一个节点
                    if (!treeNode) {
                        $('#' + treeId + '_1_a').trigger('click');
                    }
                }
            }
        };
        var userManeger = UI({
            orgTree: null,
            peopleListTable: null,
            catalog: null,
            events: {
                //添加子公司
                'click .ac-addCompany': function(e, config) {
                    seajs.use('apps/user/company', function(company) {
                        company.add({
                            container: config.openSub(),
                            data: config.org,
                            destroy: function() {
                                config.closeSub();
                            }
                        });
                    });
                },
                //编辑当前公司
                'click .ac-editCompany': function(e, config) {
                    //treeNode
                    seajs.use('apps/user/company', function(company) {
                        company.edit({
                            container: config.openSub(),
                            data: config.org,
                            destroy: function() {
                                config.closeSub();
                            }
                        });
                    });
                },
                //删除当前公司
                'click .ac-delCompany': function(e, config) {
                    seajs.use(['apps/user/company', 'ui/notify'], function(company, notify) {
                        notify.confirm({
                            msg: '确定删除 ' + config.org.name + '?',
                            callback: function(b) {
                                if (b) {
                                    company.remove(config.org);
                                }
                            }
                        });
                    });
                },

                //编辑当前部门
                'click .ac-editDepart': function(e, config) {
                    seajs.use('apps/user/editDepartment', function(depart) {
                        depart.show({
                            callback: function(depart) {

                            }
                        });
                    });
                },
                //添加子公司
                'click .ac-addDepart': function(e, config) {},
                //删除当前公司
                'click .ac-delDepart': function(e, config) {},
                //给选中的人员更换部门
                'click .ac-changeDepart': function(e, config) {
                    seajs.use('apps/user/department', function(depart) {
                        depart.show({

                        });
                    });
                }
            },
            makePeopleTree: function() {
                var _id = _.uniqueId('orgTree'),
                    orgTreeDom = this.$('.ac-orgtree').attr('id', _id);
                this.orgTree = $.fn.zTree.init(orgTreeDom, orgTreeSetting);
            },
            //点击左边的树节点，刷出右边的列表
            org: null,
            renderUser: function(treeNode) {
                if (this.org == treeNode) return;
                //如果是公司，显示公司编辑按钮 type=1时候为公司
                this.companyMenu.toggle(treeNode.type == 1);
                this.org = treeNode;
                this.catalog.html(treeNode.name).attr('title', treeNode.name);
                //刷新人员列表
                this.peopleListTable.load({
                    orgId: treeNode.id
                });
            },
            //初始化user表格
            makeRoleListTable: function() {
                this.RoleListTable = ctable({
                    container: this.$('.ac-roletable'),
                    cols: [{
                        title: '角色'
                    }],
                    // hidehead:true,
                    checkbox: false,
                    height: 'window',
                    blankText: '当前部门没有角色',
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
                                ['<a href="javascript:;" class="action-person-view" title="' + title + '">' + record.userName + '</a>', ]
                            ];
                        });
                    },
                    onselect: function(selectedData, thisData) {
                        userManeger.toolbar.find('.ac-onselect').toggleClass('hide', !selectedData.length)
                    },
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            },
            //初始化user表格
            makePeopleListTable: function() {
                this.peopleListTable = ctable({
                    container: this.$('.ac-peoples'),
                    cols: [{
                        title: '姓名',
                        width: 90
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
                                    record.reserveA
                                    // '<a href="javascript:;" class="cpr action-person-freeze">' + (record.userStatus == 1 ? "冻结" : "解冻") + '</a>'
                                ]
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
                //公司编辑按钮
                this.companyMenu = this.$('.ac-company-menu').hide();
                //给sidebar加上滚动条
                if (UI.browser.chrome) {
                    this.sidebar.addClass('scroll');
                } else {
                    this.sidebar = this.sidebar.rollbar().find('.rollbar-content');
                }

                this.catalog = this.toolbar.find('.ac-orgname');
                this.makePeopleListTable();
                this.makePeopleTree();

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
