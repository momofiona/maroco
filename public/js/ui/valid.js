define(function(require, exports, module) {
    var tips = require('ui/notify').tips,
        nameSpace = 'validate',
        defaults = {
            // Validate on onKeyup?
            onKeyup: true,
            // Conditional functions
            rules: {},
            //description
            labels: {},
            // Callback
            eachField: $.noop,
            eachInvalidField: $.noop,
            eachValidField: $.noop,
            invalid: $.noop,
            valid: $.noop,
            //检查制定的元素
            validField:function(field){
                return validateField.call(field,{},this).isValid;
            },
            label: function(msg, isSafe) {
                if (isSafe) {
                    return msg ? '<span class="c-safe"><i class="f f-done"></i> ' + msg + '</span>' : '';
                }
                if (msg.length) {
                    return '<span class="c-error"><i class="f f-warn"></i> ' + msg + '</span>';
                }
                return '';
            },
            /**
             * 显示提示信息 labelSafe
             * @param  {Object}  elem    指定表单元素
             * @param  {String,Array}  msg     提示信息
             * @param  {Boolean} isSafe  是否是成功信息
             * @param  {Object}  options tipDir和tipWithin等配置信息
             * @return {[type]}          
             */
            showLabel: function(elem, msg, isSafe) {
                //寻找label
                elem = $(elem);
                msg = msg.join ? msg.join(' ; ') : msg;
                var label = elem.data('label'),
                    form = $(elem[0].form);
                if (label) {
                    label = label.indexOf('#') === 0 ? $(label) : form.find(label);
                }
                if (label && label.length) {
                    label.html(this.label(msg, isSafe));
                } else {
                    //use tips
                    var tipid = elem.data('__tipid__');
                    if (!tipid) elem.data('__tipid__', tipid = _.uniqueId('validTip_'));
                    if (msg.length) {
                        tips({
                            id: tipid,
                            of: elem,
                            msg: '<i class="f f-' + (isSafe ? 'checkmark' : 'warn') + '"></i> ' + msg,
                            cls: (isSafe ? 'safe' : 'error') + ' validate-tips',
                            dir: elem.data('dir') || this.tipDir || 'rc',
                            within: this.tipWithin || form
                        });
                    } else {
                        $('#' + tipid).hide();
                    }
                }
            }
        },
        type = ['input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea', 'select', 'input[type="checkbox"],input[type="radio"]'],
        // All field types
        allTypes = type.join(','),
        //规则
        allRules = {
            required: {
                //输入类别   选择类
                label: ['请输入必填项', '请选择一项']
            },
            email: {
                rule: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
                label: '请输入正确的邮箱格式'
            },
            charsafe: {
                rule: /^[^\\\/:\*\?\"<>\|]*$/,
                label: '不能包含\/:*?"<>|等字符'
            },
            ip: {
                rule: /^(?:(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[0-9]\.)){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|[0-9])$/,
                label: '不合法的IP地址'
            },
            //输入类别算长度，选择类算个数
            length: {
                rule: function(value, pm, status, rule) {
                    var label;
                    if (status.fieldType == 2) {
                        //当然给radio加length是没有意义的
                        label = range(status.fieldGroup.filter(':checked').length, 0, pm, rule.label2);
                    } else {
                        label = range(value.length, 0, pm, rule.label);
                    }
                    return label;
                },
                label: ['', '至少输入 {0} 个字符', '最多输入 {1} 个字符', '请输入 {0} 到 {1} 个字符'],
                label2: ['', '至少选择 {0} 项', '最多选择 {1} 项', '请选择 {0} 到 {1} 项']
            },
            //整数
            "int": {
                rule: function(value, pm, status, rule) {
                    var label = range(value, !intReg.test(value), pm, rule.label);
                    return label;
                },
                label: ['请输入整数', '请输入整数,最小值 {0}', '请输入整数,最大值 {1}', '请输入 {0} 到 {1} 的整数']
            },
            //小数
            "float": {
                rule: function(value, pm, status, rule) {
                    var label = range(value, !$.isNumeric(value), pm, rule.label);
                    return label;
                },
                label: ['请输入一个数', '请输入一个数,最小值 {0}', '请输入一个数,最大值 {1}', '请输入 {0} 到 {1} 的一个数', '最多保留{2}位小数']
            },
            mobile: {
                rule: /^1\d{10}$/,
                label: '请输入11位手机号码'
            },
            equal: {
                rule: function(value, pm, status, rule) {
                    var form = this[0].form;
                    if (form[pm].value !== value) return rule.label;
                },
                label: '两次输入的密码不一样'
            }
        },
        /**
         * 范围定位
         * @param  {Number} num    被匹配的值
         * @param  {boolean} error  是否先天不足，不是数字
         * @param  {String} rg      括号里面的参数
         * @param  {Array} labels  提示集合，按照 空 a ,b a,b  四个来排列
         * @return {String}        错误提示
         */
        range = function(num, error, rg, labels, callback) {
            //范围枚举
            rg = rg ? _.map(rg.split(','), function(n) {
                return parseFloat(n);
            }) : [];
            var label = labels[0];
            //如果不是数字
            if (!$.isNumeric(num)) error = 1;
            if ($.isNumeric(rg[0]) && $.isNumeric(rg[1])) {
                label = labels[3];
                if (error || num < rg[0] || num > rg[1]) {
                    error = 1;
                }
            } else if ($.isNumeric(rg[1])) {
                label = labels[2];
                if (error || num > rg[1]) {
                    error = 1;
                }
            } else if ($.isNumeric(rg[0])) {
                label = labels[1];
                if (error || num < rg[0]) {
                    error = 1;
                }
            }
            //第三个附加参数标记小数位
            if ($.isNumeric(rg[2])) {
                label += ', ' + labels[4];
                if (error || num.replace(/.*\./, '').length > rg[2]) {
                    error = 1;
                }
            }
            if (error) return labelFormat(label, rg);
        },
        //data-valid解析
        validReg = /(?:^|\s)(\w+)(?:\((.*?)\))?/g,
        //整数
        intReg = /^[+-]?\d+$/,
        //format
        ruleReg = /\{(\d+)\}/g,
        labelFormat = function(msg, arr) {
            return msg ? msg.replace(ruleReg, function(a, b) {
                return arr[b] !== undefined ? arr[b] : a;
            }) : '';
        },

        // Method to validate each fields
        validateField = function(event, options) {
            var status = {
                    fieldType: this.tagName == 'SELECT' ? 1 : 0,
                    isValid: true,
                    msg: [],
                    report: function(msg) {
                        this.isValid = false;
                        this.msg.push(msg);
                    }
                },
                //类型0输入类 1select ,3 radio&checkbox
                fieldName = this.name,
                field = $(this),
                //第二型
                fieldGroup,
                form = options.form;
            //disabled元素不验证
            if (this.disabled) return status;
            //如果是radio或者checkbox，需要全组一起验证
            if (field.is(type[2])) {
                status.fieldType = 2;
                // 只需要处理第一个输入框或者[data-dir]的第一个
                if (fieldName) {
                    //============= 注意，这里的field元素变了，this和field不一定是同一个元素
                    fieldGroup = $(form[0][fieldName]).not(':disabled');
                    field = fieldGroup.filter('[data-dir]').eq(0);
                    if (!field.length) {
                        field = fieldGroup.eq(0);
                    }
                    //TODO 组内只验证一次，如果eventType submit 忽略同组元素验证
                    if (event.type == "submit" && field[0] !== this) return status;
                    status.fieldGroup = fieldGroup;
                }
            }
            //先判断类型
            var fieldCName = field.attr('valid-name') || this.name,
                // Current field value
                fieldValue = field.val() || '',
                // A index in the conditional object containing a function to validate the field value
                fieldRuleList = field.data('valid') || '',
                fieldConditional = options.rules[fieldCName],
                fieldLabel = options.labels[fieldCName] || "";
            status.required = field.attr('required'); //undefined or required
            //三无不列入监控范围,直接返回三围或disabled readabled
            if (options.eachField.call(field, event, status, options) === false || !fieldConditional && !status.required && !fieldRuleList) {
                return status;
            }
            var requiredMsg;
            if (status.required) {
                //如果是chackbox||radio 必填项没填写,当存在其他验证消息的时候，应忽略required消息；
                if (status.fieldType == 2) {
                    if (fieldGroup.filter(':checked').length == 0) requiredMsg = fieldLabel['required'] || allRules.required.label[1];
                } else {
                    if (fieldValue == "") requiredMsg = fieldLabel['required'] || allRules.required.label[0];
                }
            } else {
                //非必需项在value为空的时候跳过默认其他验证
                if (status.fieldType == 2) {
                    if (fieldGroup.filter(':checked').length == 0) return status;
                } else {
                    if (fieldValue == "") return status;
                }
            }
            if (requiredMsg) status.isValid = false;
            // keyup绑定时机
            if (!field.data('__tipid__') && options.onKeyup && field.is(type[0])) {
                field.data('__tipid__', _.uniqueId('validTip_'));
                field.on('keyup.' + nameSpace, function(event) {
                    //屏蔽tab键影响
                    //屏蔽回车提交影响
                    if (event.which !== 9&&event.which !== 13) validateField.call(this, event, options);
                });
            }
            //data-valid going
            fieldRuleList.replace(validReg, function(match, name, params) {
                //判断存在 extend[name]?,如果存在则传入参数
                var ex = allRules[name],
                    rule, rlabel;
                if (ex) {
                    rule = ex.rule;
                    if (_.isRegExp(rule)) {
                        if (!rule.test(fieldValue)) rlabel = ex.label;
                    } else if (_.isFunction(rule)) {
                        rlabel = rule.call(field, fieldValue, params, status, ex);
                    }
                    if (rlabel) status.report(fieldLabel[name] || rlabel);
                }
            });
            //name rules validate
            if (fieldConditional) {
                var rlabel;
                if (_.isRegExp(fieldConditional.rule)) {
                    if (!fieldConditional.rule.test(fieldValue)) rlabel = fieldConditional.label;
                } else if (_.isFunction(fieldConditional)) {
                    rlabel = fieldConditional.call(field, fieldValue, status, options);
                } else if (_.isFunction(fieldConditional.rule)) {
                    rlabel = fieldConditional.rule.call(field, fieldValue, status, options, fieldConditional);
                }
                if (rlabel) status.report(rlabel);
            }

            // If the field is valid
            if (status.isValid) {
                field.add(fieldGroup).removeClass('invalid').addClass('valid');
                // Call the eachValidField callback
                options.eachValidField.call(field, event, status, options);
            } else {
                field.add(fieldGroup).removeClass('valid').addClass('invalid');
                // Call the eachInvalidField callback
                options.eachInvalidField.call(field, event, status, options);
            }
            var _msg = status.msg.length ? status.msg : requiredMsg || '';
            if (fieldLabel) {
                if (status.isValid) {
                    _msg = fieldLabel['valid'] || _msg;
                } else {
                    _msg = (_.isString(fieldLabel) ? fieldLabel : fieldLabel['invalid']) || _msg;
                }
            }
            options.showLabel(field, _msg, status.isValid);
            // Returns the field status
            return status;
        },
        validate = function(options) {
            options = _.create(defaults, options);
            var form = options.form;
            form.attr('novalidate', true).data(nameSpace, {
                options: options
            }).on('change.' + nameSpace, 'input,select,textarea', function(event) {
                validateField.call(this, event, options);
            }).on('submit.' + nameSpace, function(event) {
                event.preventDefault();
                var formValid = true;
                var fields = form.find(allTypes);
                fields.each(function() {
                    var status = validateField.call(this, event, options);
                    if (!status.isValid) {
                        formValid = false;
                    }
                });
                // If form is valid
                if (formValid) {
                    // Is a function?
                    if ($.isFunction(options.valid)) {
                        options.valid.call(form, event, options);
                    }
                } else {
                    event.stopImmediatePropagation();
                    // Is a function?
                    if ($.isFunction(options.invalid)) {
                        options.invalid.call(form, event, options);
                    }
                }
            });
            return options;
        }
    return validate;
});
