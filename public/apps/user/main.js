define(function(require, exports, module) {
    var ctable = require('ui/ctable');
    var searchbox = require('ui/searchbox');
    var template = require('./main.html');
    var buttonset = require('ui/buttonset');
    require('ztree');
    require('css/zTree/zTreeStyle.css');

    // var url = _.queryString(location.search);
    exports.show = function(opt) {
        var enterpriseId = "";
        var orgTreeSetting = {
            data: {
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pIdKey: 'pid',
                    RootPid: 'ROOT'
                }
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
        var userManeger = UI({
            orgTree: null,
            peopleListTable: null,
            catalog: null,
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
                        _t.orgTree.expandAll(true);
                        $('#' + _id + '_1_a').click();
                    }

                });
            },
            //点击左边的树节点，刷出右边的列表
            renderUser: function(treeNode) {
                this.catalog.html('<i class="f f-org" title="' + treeNode.name + '"></i> ' + treeNode.name);
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
                        width: 60
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
                        title: '职务'
                    }, {
                        title: '角色',
                        width: 100
                    }, {
                        title: '状态',
                        width: 60
                    }, {
                        title: '操作',
                        width: 180
                    }],
                    checkbox: true,
                    height: 'window',
                    blankText: '当前部门没有成员',
                    events: {
                        'click .action-person-view': function(event, tr, data, config) {
                            debugger;
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
                            var status = {
                                "0": "未激活",
                                "1": "正常",
                                "2": "冻结",
                                "3": "已删除"
                            }
                            var title = "登录名:" + record.loginName;
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
                                    status[record.userStatus],
                                    '<a href="javascript:;" class="cpr action-person-freeze">' + (record.userStatus == 1 ? "冻结" : "解冻") + '</a>\
                        <a href="userdetails.html?userId=' + record.userId + '" class="cpr action-person-view">编辑</a>\
                        <a href="javascript:;" class="cpr action-person-reset">重置密码</a>\
                        <a href="javascript:;" class="action-person-remove">删除</a>'
                                ]
                            ];
                        });
                    },
                    itemsOnPage: UI.itemsOnPage,
                    url: '/json/getUserByOrgId',
                    baseparams: {}
                });
            },
            init: function() {
                this.el.addClass('noscroll').html(template).appendTo(opt.container);
                this.catalog = this.$('.ac-orgname');
                this.makePeopleListTable();
                this.makePeopleTree();
                //切换用户和角色

                buttonset({
                    el: this.$('.ac-user-role'),
                    onselect: function(e, config) {
                        debugger;
                        // debugger;
                    }
                });
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
