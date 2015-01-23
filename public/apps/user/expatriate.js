define(function(require, exports, module) {
    var $ = require('jquery');
    var dot = require('dot');
    require('js/vendor/moment.js');
    var form = require('./expatriate.html');
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
                $.post("../user/createOrUpdateExpatriate", validateForm.serialize()+'&userId='+opt.userId, function(content) {
                    notify({
                        msg: '保存成功',
                        fixed: true,
                        timeout: 2,
                        iconCls: 'success'
                    });
                    opt.saved && opt.saved.call(validateForm, content);
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
            conditional: {

            },
            description: {
                
            }
        });
    }
    exports.show = function(opt) {
    	$(form).find('#birthdayTime').datepicker({
            showButtonPanel: true,
            changeMonth: true,
            changeYear: true
        });
        /*
        userId: userId || '', //userId为空的时候为编辑模式,
        action: action,//edit  self
        orgId:orgId,
        orgName:orgName,
        container: container,
        $.ajax("../user/getUserRoles?userId="+opt.userId))
         */
      
        var ajax;
        //编辑  创建  self
        if (opt.action === 'self') {
            //查看自己个人设置
            ajax = $.when($.getJSON("../user/getOneUser?userId=" + opt.userId));
            ajax.done(function(userData) {
                var user;
                user = userData.result;
                user.__self=1;
                var temp = dot.template(form)(user);
                var validateForm = $(temp).appendTo(opt.container.empty());
                validate(validateForm, opt);
                opt.callback && opt.callback.call(validateForm, user);
            });
        } else if (opt.action === "edit") {
            //编辑用户
            ajax = $.when($.getJSON("../user/getOneUser?userId=" + opt.userId), $.ajax("../user/getUserRoles?userId=" + opt.userId), $.getJSON("../role/getRoleList"));
            ajax.done(function(userData, userRoleData, allRoleData) {
                var user;
                user = userData[0].result;
                user.__role = allRoleData[0].result;
                var temp = dot.template(form)(user);
                var validateForm = $(temp).appendTo(opt.container.empty());
                var roleContainer = $('#vm_user_baseinfo');
                validate(validateForm, opt);
                $.each(userRoleData[0].result, function(i, o) {
                    roleContainer.find('input[value=' + o.id + ']').get(0).checked = true;
                });
                opt.callback && opt.callback.call(validateForm, user);
            });
        } else if (opt.action == 'create') {
            //创建用户
            ajax = $.when($.getJSON("../role/getRoleList"));
            ajax.done(function(allRoleData) {
                var user;
                user = {};
                user.__role = allRoleData.result;
                var temp = dot.template(form)(user);
                var validateForm = $(temp).appendTo(opt.container.empty());
                validate(validateForm, opt);
                opt.callback && opt.callback.call(validateForm, user);
            });
        }
    }
    
});
