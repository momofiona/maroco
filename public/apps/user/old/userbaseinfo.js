define(function(require, exports, module) {
    var $ = require('jquery');
    var dot = require('dot');
    var form = require('./userbaseinfo.html');
    var tooltip = require('js/ui.validateTooltip');
    var notify = require('js/notify');
    //表单验证
    var validate = function(validateForm, opt) {
        validateForm = validateForm.validate({
            onKeyup: true,
            onBlur: true,
            onChange: true,
            sendForm: false,
            valid: function(event, status, options) {
                $.post("../user/createOrUpdate", validateForm.serialize() + '&orgId=' + opt.orgId+'&enterpriseId='+ opt.enterpriseId, function(data) {
                    if (data.errorCode == 500) {
                        top.UI.notify({
                            msg: data.result,
                            fixed: true,
                            timeout: 2,
                            iconCls: 'error'
                        });
                    } else {
                        top.UI.notify({
                            msg: '操作成功',
                            fixed: true,
                            timeout: 2,
                            iconCls: 'success'
                        });
                        opt.saved && opt.saved.call(validateForm, data);
                    }
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
                checkIdCard: function() {
                    if ($(this).val() == '') {
                        return true;
                    } else {
                       // var reg = new RegExp('^(\\d{18,18}|\\d{15,15}|\\d{17,17}[x|X])$')
                       var reg = new RegExp('^\\w+$')
                        return reg.test($(this).val()) && $(this).val().length <= 18;
                    }
                    // return ($.isNumeric($(this).val())&&$(this).val().length == 18)||$(this).val()=='';
                },
                checkMobile: function() {
                    var reg = new RegExp('^1\\d{10}$')
                    return reg.test($(this).val()) && $(this).val().length <= 11;
                },
                checkLoginName: function() {
                    if (opt.userId) {
                        return true;

                    } else {
                        var checkName = true;
                        $.ajax({
                            url: '../user/loginNameExist',
                            async: false,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                loginName: $('#loginName').val()
                            }
                        }).done(function(data) {
                            if (data.errorCode == 0) {
                                checkName = false;
                            }
                        });
                        return checkName;
                    }
                }
            },
            description: {
                loginName: {
                    required: '登陆账号不能为空',
                    conditional: '登陆名不合法或已被注册'
                },
                email: {
                    required: '邮箱不能为空',
                    pattern: '邮箱格式不正确'
                },
                userName: {
                    required: '真实姓名不能为空',
                    pattern: '存在非法字符'
                },
                mobile: {
                    conditional: '格式不正确'
                },
                idCard: {
                    conditional: '格式不正确'
                },
                position: {
                    pattern: '存在非法字符'
                }

            }
        });
    }
    exports.show = function(opt) {
        opt.enterpriseId=opt.enterpriseId||"";
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
            ajax = $.when($.getJSON("../user/getOneUser?userId=" + opt.userId), $.ajax("../user/getUserRoles?userId=" + opt.userId));
            ajax.done(function(userData, userRoleData) {
                var user;
                user = userData[0].result;
                user.__role = userRoleData[0].result;
                user.__self = 1;
                var temp = dot.template(form)(user);
                var validateForm = $(temp).appendTo(opt.container.empty());
                validate(validateForm, opt);
                opt.callback && opt.callback.call(validateForm, user);
            });
        } else if (opt.action === "edit") {
            //编辑用户
            ajax = $.when($.getJSON("../user/getOneUser?userId=" + opt.userId), $.ajax("../user/getUserRoles?userId=" + opt.userId), $.getJSON("../role/getRoleList?enterpriseId="+opt.enterpriseId));
            ajax.done(function(userData, userRoleData, allRoleData) {
                var user;
                user = userData[0].result;
                user.__role = allRoleData[0].result;
                var temp = dot.template(form)(user);
                var validateForm = $(temp).appendTo(opt.container.empty());
                var roleContainer = $('#vm_user_baseinfo');
                validate(validateForm, opt);
                $.each(userRoleData[0].result, function(i, o) {
                    var input=roleContainer.find('input[value=' + o.id + ']').get(0);
                    if(input) input.checked = true;
                });
                opt.callback && opt.callback.call(validateForm, user);
            });
        } else if (opt.action == 'create') {
            //创建用户
            ajax = $.when($.getJSON("../role/getRoleList?enterpriseId="+opt.enterpriseId));
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
