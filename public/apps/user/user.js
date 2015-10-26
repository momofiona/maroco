define(function(require, exports, module) {
    var notify = require('ui/notify');
    var template = _.dot(require('./user.html'));
    var searchbox = require('ui/searchbox');
    var upload = require('ui/upload');
    exports.show = function(opt) {
        //人员信息
        var man = UI({
            events: {
                'click .ac-back': 'destroy',
                'click .ac-reset': 'reset',
                'click .ac-removeOrg': 'removeOrg',
                'click .ac-join-department': function(e, config) {
                    seajs.use('apps/user/department', function(depart) {
                        depart.show({
                            onselected: function(departs) {
                                // console.log(departs);
                                _.each(departs, function(o) {
                                    o.orgId = o.id;
                                    o.orgName = o.name;
                                });
                                config.addOrg(departs);
                            }
                        });
                    });
                },
                //组织角色那边小箭头，收缩高度
                'click .ac-toggle': function(e, conf) {
                    var t = $(this),
                        ic = t.find('.ac-toggle-tip'),
                        ul = t.parent().children('ul');
                    if (ul.is(':hidden')) {
                        ul.show('fast');
                        ic.removeClass('rotate3');
                    } else {
                        ul.hide('fast');
                        ic.addClass('rotate3');
                    }
                }
            },
            //当前人员的角色ID ,暂时没用到
            // roles: {},
            destroy: function(e, config) {
                config = config || this;
                opt.destroy();
            },
            render: function(e, config) {
                config = config || this;
                config.el.addClass('m').html(template(opt));
            },
            reset: function(e, config) {
                config = config || this;
                config.render();
                config.orgListEl = config.$('.ac-orglist').empty();
                config.otherRoleBox = config.$('.ac-other-role').empty();
                this.roleCache = {};
                config.addOrg(opt.data.orgs);
            },
            //移除部门/组织，
            removeOrg: function(e, config) {
                var _t = $(this.parentNode),
                    orgId = _t.attr('orgid');
                notify.confirm({
                    mask: true,
                    msg: '确定退出部门： [' + _t.find('.ac-orgname').text() + ']',
                    callback: function(b) {
                        if (b) {
                            delete config.roleCache[orgId];
                            var tmpids = {},_other=config.otherRoleBox;
                            _.each(config.roleCache, function(o) {
                                _.each(o.roleList, function(role) {
                                    tmpids[role.id] = 1;
                                })
                            });
                            //把内部属于某个部门下继承的角色归纳到other里面
                            _t.find('>ul').children().each(function(i, o) {
                                var id = o.id.slice(2);
                                if (tmpids[id]){
                                    $(this).appendTo(_other);
                                }
                            });
                            _t.remove();
                            //清除其他框内相应的东西
                            config.otherRoleBox.children().each(function(i, o) {
                                //如果o.id不存在于任何cache中，则删掉
                                var id = o.id.slice(2);
                                if (!tmpids[id]) $(this).remove();
                            });
                            _t.getRoleLis();
                        }
                    }
                });
            },
            //所有role缓存
            roleCache: {},
            //包含
            roleLis: null,
            getRoleLis: function() {
                this.roleLis = this.orgListEl.find('li').add(this.otherRoleBox.children());
            },
            //添加部门/组织 》 获取部门组织下的权限
            addOrg: function(orgs) {
                if (!orgs) return;
                orgs = _.isArray(orgs) ? orgs : [orgs];
                var _t = this;
                var orgIds = _.pluck(orgs, 'orgId').join();
                _t.getRelativeRoles(orgIds, function(data) {
                    var cache = _t.roleCache;
                    //data按照orgId分组 找到 "p"+orgId 的节点插入
                    var s = "",
                        others = "";
                    //匹配每一个是否已经有权限,后端已经实现，不用前端匹配
                    _.each(data, function(v, k) {
                        if (!cache[v.orgId]) {
                            //生成容器包
                            s += '<div class="info" style="margin-top:5px;" orgid="' + v.orgId + '"><i class="f f-close notify-close xr am-rotate ac-removeOrg" title="退出本部门"></i><div class="ac-toggle user-select"><i class="f m2 f-down ac-toggle-tip"></i> <span class="ac-orgname">' + v.orgName + '</span><input type="hidden" name="orgId" value="' + v.orgId + '"></div><ul style="margin:4px 0;border:0" class="menu log">';
                            _.each(v.roles, function(o, i) {
                                var oLi = _t.otherRoleBox.find('#li' + o.id),
                                    checked;
                                //插入本组织的html
                                if (o.orgId == v.orgId) {
                                    //从其他里面删除属于自己的
                                    if (oLi.length) {
                                        checked = oLi.find('input')[0].checked;
                                        oLi.remove();
                                    }
                                    //如果是本组织的直属角色
                                    s += '<li id="li' + o.id + '" style="padding:5px 10px;"><label' + (o.power ? ' class="c-safe"' : '') + '><input type="checkbox" value="' + o.id + '"' + ((checked == undefined ? o.power : checked) ? ' checked' : '') + '> ' + o.name + '</label></li>';
                                } else if (!cache[o.orgId] && !oLi.length) {
                                    //如果此权限不存在于任何组织
                                    others += '<li id="li' + o.id + '" style="padding:5px 10px;"><label' + (o.power ? ' class="c-safe"' : '') + '><input type="checkbox" value="' + o.id + '"' + (o.power ? ' checked' : '') + '> ' + o.name + ' (' + o.orgName + ')' + '</label></li>';
                                }
                            });
                            s += '</ul></div>';
                            //存入role缓存
                            cache[v.orgId] = v;
                        }
                    });
                    _t.orgListEl.append(s);
                    others && _t.otherRoleBox.append(others);
                    _t.getRoleLis();

                });
            },
            //获取全部权限
            getRelativeRoles: function(orgIds, fn) {
                var _t = this;
                $.ajax({
                    url: "/json/getRoleMapByOrgIds",
                    data: {
                        orgIds: orgIds
                    },
                    dataType: 'json',
                    success: function(v) {
                        fn(v.result);
                    }
                })
            },

            init: function() {
                var t = this;
                this.reset();
                this.el.appendTo(opt.container);
                //searchbox
                this.$('.ac-role-search').searchbox({
                    placeholder: '筛选角色',
                    value: '',
                    input: function(value, filter) {
                        if (value) {
                            t.roleLis.hide().filter(':contains(' + value + ')').show();
                        } else {
                            t.roleLis.show();
                        }

                    }
                });
                //头像UPLOAD
                var avanta=this.avanta = this.$('.ac-avanta'),
                changer=this.$('.ac-changeavanta');
                upload({
                    browse_button: changer[0], 
                    container: changer.parent()[0],
                    url: '/upload', 
                    multi_selection:false,
                    filters: {
                        max_file_size: '1mb',
                        mime_types: [{
                            title: "Image files",
                            extensions: "jpg,gif,png"
                        }]
                    },
                    FilesAdded: function(up, files) {
                        $.each(files, function(i, o) {
                            o.url = '/upload'; 
                        })
                    },
                    BeforeUpload: function(up, file) {
                        up.settings.url = file.url; 
                    },
                    FileUploaded: function(up, file, data) {
                        avanta.attr('src',seajs.data.base+'temp/'+data.name)
                    }
                });
            }
        });


    }
});
