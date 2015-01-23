define(function(require, exports, module) {
    var $ = require('jquery');
    var dot = require('dot');
    require('js/vendor/moment.js');
    var form = require('./password.html');
    var tooltip = require('js/ui.validateTooltip');
    var notify = require('js/notify');
    //表单验证
    var validate = function(validateForm, opt) {
        validateForm = validateForm.validate({
            onKeyup: false,
            onBlur: true,
            onChange: true,
            sendForm: false,
            valid: function(event, status, options) {
                $.post("../user/changePasswordSelf", {
                    userId: opt.userId,
                    oldPassword: $('#oldPassword').val(),
                    password: $('#newPassword').val(),
                    rePassword: $('#newPassword2').val()
                }, function(content) {
                    var type = "success";
                    if (content.errorCode == '500') {
                        type = "error";
                    }else{
                        validateForm[0].reset();
                    }
                    notify({
                        msg: content.result,
                        fixed: true,
                        timeout: 2,
                        iconCls: type
                    });
                    // opt.saved && opt.saved.call(validateForm, content);
                });
            },
            invalid: function(event, status, options) {
                //this.find('.error-valid').eq(0).focus();
                tooltip.focus(this);
            },
            eachValidField: function(event, status, options) {
                tooltip.next(this, validateForm);
                //this.removeClass('error-valid');
            },
            eachInvalidField: function(event, status, options, invalidlog) {
                tooltip.show(this, invalidlog, validateForm);
                //this.addClass('error-valid');
            },
            conditional: {},
            description: {
                platformName: {
                    required: '必填项不能为空',
                    pattern: "格式不正确"
                }
            }
        });
    }
    exports.show = function(opt) {
        var validateForm = $(form).appendTo(opt.container.empty());
        validate(validateForm, opt);
    }

});
