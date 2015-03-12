define(function(require, exports, module) {
    var notify = require('ui/notify');
    require('css/zTree/zTreeStyle.css');
    require('js/vendor/zTree/jquery.ztree.all-3.5.min.js');
    var formTemp = _.dot(require('./company.html'));
    var validate = require('ui/validate');
    //company edit remove add
    //创建公司
    /*    exports.add2 = function(option) {
                var dialog = notify({
                    title: '创建子公司',
                    draggable: true,
                    mask: true,
                    width: 400,
                    height: 300,
                    oncreate: function() {
                        var _t = this;
                        _t.form = $(form).appendTo(_t.contentEl);
                        validForm(_t.form);
                        _t.el.position(_t.position);
                    },
                    buttons: [{
                        label: '确定',
                        cls: 'error',
                        click: function(e, config) {
                            config.form.submit();
                        }
                    }, {
                        label: '关闭',
                        cls: 'silver dialog-close'
                    }]
                });

            }*/
    //表单验证
    var validForm = function(form) {
            validate({
                form: form,
                valid: function(event, status, options) {
                    var sb = this.find(':submit').attr('disabled', true);
                    setTimeout(function() {
                        sb.removeAttr('disabled');
                    }, 3000);
                    //submit ajax
                },
                //条件
                conditional: {},
                //预处理数据
                prepare: {},
                description: {
                    account: {
                        required: '请填写组织名称'
                    }
                }
            });
        }
        //创建公司
    exports.add = function(options) {
            UI({
                events: {
                    'click .ac-back': function(e, config) {
                        options.destroy();
                    }
                },
                init: function() {
                    this.form = this.el.addClass('m10').appendTo(options.container).html(formTemp({
                        title: '创建 '+options.data.name+' 的子公司'
                    })).find('form');
                    validForm(this.form);
                }
            })
        }
        //编辑公司
    exports.edit = function(options) {
            UI({
                events: {
                    'click .ac-back': function(e, config) {
                        options.destroy();
                    }
                },
                init: function() {
                    this.form = this.el.addClass('m10').appendTo(options.container).html(formTemp({
                    title:'编辑:'+options.data.name
                })).find('form');
                    validForm(this.form);
                }
            })
        }
        //删除公司
    exports.remove = function(options) {
        console.log('remove company');
    }
});
