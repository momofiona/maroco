define(function(require, exports, module) {
    var tpl = _.dot(require('./rolecreateandedit.html'));
    var notify = require('ui/notify');
    var validate = require('ui/validate');

    exports.show = function(opt) {
        //根据opt.data.orgId获取继承和互斥数据
        var fakeData = {
                extend: [{
                    id: 'pofiuhalwejf',
                    name: '一般职员',
                    orgId: '232',
                    orgName: '财务部'
                }, {
                    id: 'oiayiuewfh',
                    name: '新进职员',
                    orgId: '232',
                    orgName: '财务部'
                }],
                exclusion: [{
                    id: 'oihfhfasef',
                    name: 'CEOCTOCFO',
                    orgId: 'asdf',
                    orgName: '综合管理部'
                }]
            }
            //弹出窗口
        var dialog = notify({
            title: opt.isEdit ? '编辑角色' : '新建角色',
            msg: tpl(opt.data),
            width: 700,
            mask: true,
            buttons: [{
                label: '确定',
                cls: 'note',
                click: function(e, conf) {
                    conf.form.form.submit();
                }
            }, {
                label: '取消',
                click: 'close'
            }],
            events: {
                'click .ac-add-extend': 'selectRoles',
                'click .ac-add-exclusion': 'selectRoles'
            },
            //弹窗选择权限
            selectRoles: function(e, conf) {
                var t = $(this);
                //获取当前部门的所有可用权限
                $.ajax({
                    url: "/json/getRoleMapByOrgIds",
                    data: {
                        orgIds: opt.data.orgId
                    },
                    dataType: 'json',
                    success: function(v) {
                        var s = '<ul class="menu">',
                            cache = v.result[0].roles;
                        //这里需要错误处理
                        _.each(cache, function(o, i) {
                            s += '<li style="padding:5px 10px;"><label' + (o.power ? ' class="c-safe"' : '') + '><input type="checkbox" value="' + i + '"> ' + o.name + ' (' + o.orgName + ')</label></li>';
                        });
                        s += '</ul>';
                        notify({
                            title: '选择权限',
                            msg: s,
                            width:400,
                            getSelectedRoles: function() {
                                var ret=[];
                                this.$('input').each(function(i,o){
                                    if(o.checked){
                                        ret.push(cache[o.value]);
                                    }
                                });
                                return ret;
                            },
                            buttons: [{
                                label: '确定',
                                cls: 'note',
                                click: function(e, cf) {
                                    conf[t.hasClass('ac-add-extend')?'addExtend':'addExclusion'](cf.getSelectedRoles());
                                    cf.close();
                                }
                            }, {
                                label: '取消',
                                click: 'close'
                            }]
                        });
                    }
                });
            },
            addExtend: function(roles) {
                if (!roles) return;
                var s = "";
                _.each(roles, function(o, i) {
                    s += '<div class="safe moon" style="margin-bottom:1px"><i class="f f-multiply notify-close am-rotate xr" onclick="$(this).parent().remove();"></i><input name="extendId" type="hidden" value="' + o.id + '">' + o.name + '(' + o.orgName + ')</div>';
                });
                this.extendEl.append(s);
            },
            addExclusion: function(roles) {
                if (!roles) return;
                var s = "";
                _.each(roles, function(o, i) {
                    s += '<div class="error moon" style="margin-bottom:1px"><i class="f f-multiply notify-close am-rotate xr" onclick="$(this).parent().remove();"></i><input name="extendId" type="hidden" value="' + o.id + '">' + o.name + '(' + o.orgName + ')</div>';
                });
                this.exclusionEl.append(s);
            },
            create: function() {
                this.extendEl = this.$('.ac-extend');
                this.exclusionEl = this.$('.ac-exclusion');
                this.addExtend(fakeData.extend);
                this.addExclusion(fakeData.exclusion);

                //validate
                this.form = validate({
                    form: this.$('form'),
                    tipWithin: this.mask,
                    valid: function(event, status, options) {
                        console.log('valid');
                    },
                    invalid: function(event, status, options) {
                        console.log('invalid');
                    },
                    description: {
                        name: {
                            required: '请输入角色名称'
                        }
                    }
                });
            }
        });

    }
});
