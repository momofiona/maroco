define(function(require, exports, module) {
    var notify = require('ui/notify');
    var template = _.dot(require('./user.html'));
    var orgTemp = _.dot('{{~it :v:i}}\
            <div class="info m1 r3"><i class="f m2 f-down"></i><i class="f f-multiply notify-close xr ac-removeOrg"></i>{{=v.orgName}}\
                <input type="hidden" name="orgId" value="{{=v.orgId}}">\
            </div><div id="p{{=v.orgId}}" class="ac-powers"><i class="i i-loading m2"></i></div>{{~}}');
    var powerTemp = _.dot('<ul style="border-top:0" class="menu r1">{{~it :v:i}}\
            <li style="padding:5px 10px;"><label title="{{=v.description}}"{{?v.power}} class="c-safe"{{?}}><input type="checkbox" value="{{=v.id}}"{{?v.power}} checked{{?}}> {{=v.name}}</label></li>\
            {{~}}</ul>');
    exports.show = function(opt) {
        //人员信息
        var man = UI({
            events: {
                'click .ac-back': 'destroy',
                'click .ac-reset': 'reset',
                'click .ac-removeOrg': 'removeOrg',
                'click .ac-join-department':function(e,config){
                    seajs.use('apps/user/department', function(depart) {
                        depart.show({
                            onselected: function(departs) {
                                // console.log(departs);
                                _.each(departs,function(o){
                                    o.orgId=o.id;
                                    o.orgName=o.name;
                                });
                                config.addOrg(departs);
                            }
                        });
                    });
                }
            },
            //当前人员的角色ID
            roles: {},
            destroy: function(e, config) {
                config = config || this;
                opt.destroy();
            },
            render: function(e, config) {
                config = config || this;
                config.el.addClass('m').html(template(opt));
            },
            reset: function(e, config) {
                config=config||this;
                config.render();
                config.orgListEl = config.$('.ac-orglist');
                config.addOrg(opt.data.orgs);
            },
            //移除部门/组织
            removeOrg: function(e, config) {
                var _t = $(this.parentNode);
                notify.confirm({
                    mask: true,
                    msg: '确定退出 ['+_t.text()+']',
                    callback: function(b) {
                        if (b) {
                            _t.next().andSelf().remove();
                        }
                    }
                });
            },
            //添加部门/组织 》 获取部门组织下的权限
            addOrg: function(orgs) {
                if (!orgs) return;
                orgs = _.isArray(orgs) ? orgs : [orgs];
                var _t = this;
                _t.orgListEl.append(orgTemp(orgs));
                var orgIds = _.pluck(orgs, 'orgId').join();
                _t.getRelativeRoles(orgIds, function(data) {
                    //data按照orgId分组 找到 "p"+orgId 的节点插入,
                    data = _.groupBy(data, 'orgId');
                    //匹配每一个是否已经有权限,后端已经实现，不用前端匹配
                    // var ownedRoles=_.groupBy(opt.data.roles, 'id');
                    _.each(data, function(v, k) {
                        $('#p'+k).html(powerTemp(v));
                    });

                });
            },
            //获取全部权限
            getRelativeRoles: function(orgIds, fn) {
                var _t = this;
                $.ajax({
                    url: "/json/getRoleByOrgIds",
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
                this.reset();
                this.el.appendTo(opt.container);
            }
        });


    }
});
