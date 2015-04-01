/* https://github.com/DiegoLopesLima/Validate
 *
 * 
 * 
 *
 *
 * 
 * remote 
 * 
 */
define(function(require, exports, module) {
    var tips = require('ui/tips');
    var defaults = {
        // Send form if is valid?
        sendForm: false,
        // Use WAI-ARIA properties
        waiAria: true,
        // Validate on submit?
        onSubmit: true,
        // Validate on onKeyup?
        onKeyup: false,
        // Validate on onBlur?
        onBlur: false,
        // Validate on onChange?
        onChange: true,
        // Default namespace
        nameSpace: 'validate',
        // Conditional functions
        condition: {},
        // Fields descriptions
        msg: {},
        // Callback
        eachField: $.noop,
        eachInvalidField: $.noop,
        eachValidField: $.noop,
        invalid: $.noop,
        valid: $.noop,
        // A fielter to the fields
        filter: '*'
    }


    var type = ['input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea', 'select', 'input[type="checkbox"],input[type="radio"]'],

        // All field types
        allTypes = type.join(','),
        //规则
        //data-valid="required regexp(^1231234$) number(10.00,20.00) length(6,20) email url date(yyyy-MM-dd hh:mm:ss)"
        valid = {
            email:function(v,p,status){
                var re=/^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/.test(v);
                if(!re) status.msg=msg.email;
                return re;
            },
            url:function(v,p,status){
                var re=/^https?\:\/\/[^\s\/]+(?:\.[^\s\/]+)+(?:\/[^\s]+)*$/.test(v);
                status.msg=msg.url;
                return re;
            },
            number:function(v,p,status){
                if(!$.isNumeric(v)) return false;
                v=v-0;
                //如果存在参数
                //一个参数的时候表明
                if(p){
                    p=p.split(',');
                    p[0]
                }else{
                    return true;
                }
            },
            integer:function(){
                
            }
        },
        msg={
            required:'必填项，请输入内容'
            email:'请输入正确的邮箱格式',
            url:'请输入正确的URL链接',
            number:'请输入0~10 之间的数'
        }

        // Method to validate each fields
        validateField = function(event, options) {
            var status={
                msg:''
            },
                // Current field
                field = $(this),
                fieldCName=field.attr('cname')||field.attr('name'),
                // Current field value
                fieldValue = field.val() || '',
                // A index in the conditional object containing a function to validate the field value
                fieldConditional = field.data('valid')||'',
                fieldRequired=field.data('required'),
                name = 'validate';

                fieldConditional.replace(/(?:^|\s)(\w+)(?:\((.*?)\))?/g,function(match,name,params){
                    //判断存在 extend[name]?,如果存在则传入参数
                    var ex=extend[name];
                    if(ex){
                        ex(fieldValue,params,status);
                    }
                });
/*            // The conditional exists?
            if (fieldConditional != undefined) {

                // The fieldConditional is a function?
                if ($.isFunction(fieldConditional)) {

                    status.conditional = !!fieldConditional.call(field, fieldValue, options);
                } else {

                    var

                        // Splits the conditionals in an array
                        conditionals = fieldConditional.split(/[\s\t]+/);

                    // Each conditional
                    for (var counter = 0, len = conditionals.length; counter < len; counter++) {

                        if (options.conditional.hasOwnProperty(conditionals[counter]) && !options.conditional[conditionals[counter]].call(field, fieldValue, options)) {

                            status.conditional = false;
                        }
                    }
                }
            }

            // Is required?
            if (fieldRequired) {

                // Verifies the field type
                if (field.is(type[0] + ',' + type[1])) {

                    // Is empty?
                    if (!fieldValue.length > 0) {

                        status.required = false;
                    }
                } else if (field.is(type[2])) {

                    if (field.is('[name]')) {

                        // Is checked?
                        if ($('[name="' + field.prop('name') + '"]:checked').length == 0) {

                            status.required = false;
                        }
                    } else {

                        status.required = field.is(':checked');
                    }
                }
            }*/

            // Verifies the field type
            if (field.is(type[0])) {

               
            }
            var log=fieldDescription.valid;
            if (event.type != 'keyup') {
                if (!status.required) {
                    log = fieldDescription.required;
                } else if (!status.pattern) {
                    log = fieldDescription.pattern;
                } else if (!status.conditional) {
                    log = fieldDescription.conditional;
                }

            }
            log = log || '';

            if (typeof(validation.each) == 'function') {

                validation.each.call(field, event, status, options, log);
            }

            // Call the eachField callback
            options.eachField.call(field, event, status, options, log);

            // If the field is valid
            if (status.required && status.pattern && status.conditional) {

                // If WAI-ARIA is enabled
                if (!!options.waiAria) {

                    field.prop('aria-invalid', false);
                }

                if (typeof(validation.valid) == 'function') {

                    validation.valid.call(field, event, status, options);
                }

                // Call the eachValidField callback
                options.eachValidField.call(field, event, status, options);
            } else {

                // If WAI-ARIA is enabled
                if (!!options.waiAria) {

                    field.prop('aria-invalid', true);
                }

                if (typeof(validation.invalid) == 'function') {

                    validation.invalid.call(field, event, status, options, log);
                }

                // Call the eachInvalidField callback
                options.eachInvalidField.call(field, event, status, options, log);
            }

            // Returns the field status
            return status;
        };

    $.extend({

        // Method to extends validations
        validateExtend: function(options) {

            return $.extend(extend, options);
        },

        // Method to change the default properties of jQuery.fn.validate method
        validateSetup: function(options) {

            return $.extend(defaults, options);
        }
    }).fn.extend({

        // Method to validate forms
        validate: function(options) {
            options = _.proto(defaults, options);

            return $(this).validateDestroy().each(function() {

                var form = $(this);

                // This is a form?
                if (form.is('form')) {

                    form.data(name, {
                        options: options
                    });

                    var fields = form.find(allTypes),

                        // Events namespace
                        namespace = options.nameSpace;

                    if (form.is('[id]')) {

                        fields = fields.add('[form="' + form.prop('id') + '"]').filter(allTypes);
                    }

                    fields = fields.filter(options.filter);

                    // If onKeyup is enabled
                    if (!!options.onKeyup) {
                        fields.filter(type[0]).on('keyup.' + namespace, function(event) {
                            //屏蔽tab键影响
                            if (event.which === 9) return;
                            validateField.call(this, event, options);
                        });
                    }

                    // If onBlur is enabled
                    if (!!options.onBlur) {

                        fields.on('blur.' + namespace, function(event) {

                            validateField.call(this, event, options);
                        });
                    }

                    // If onChange is enabled
                    if (!!options.onChange) {

                        fields.on('change.' + namespace, function(event) {

                            validateField.call(this, event, options);
                        });
                    }

                    // If onSubmit is enabled
                    if (!!options.onSubmit) {
                        form.on('submit.' + namespace, function(event) {
                            var formValid = true;
                            fields.each(function() {

                                var status = validateField.call(this, event, options);

                                if (!status.pattern || !status.conditional || !status.required) {

                                    formValid = false;
                                }
                            });

                            // If form is valid
                            if (formValid) {

                                // Send form?
                                if (!options.sendForm) {

                                    event.preventDefault();
                                }

                                // Is a function?
                                if ($.isFunction(options.valid)) {

                                    options.valid.call(form, event, options);
                                }
                            } else {

                                event.preventDefault();
                                event.stopImmediatePropagation();

                                // Is a function?
                                if ($.isFunction(options.invalid)) {

                                    options.invalid.call(form, event, options);
                                }
                            }
                        });
                    }
                }
            });
        },

        // Method to destroy validations
        validateDestroy: function() {

            var form = $(this),

                dataValidate = form.data(name);
            // If this is a form
            if (form.is('form') && $.isPlainObject(dataValidate) && typeof(dataValidate.options.nameSpace) == 'string') {

                var fields = form.removeData(name).find(allTypes).add(form);

                if (form.is('[id]')) {

                    fields = fields.add($('[form="' + form.prop('id') + '"]').filter(allTypes));
                }
                fields.off('.' + dataValidate.options.nameSpace);
            }

            return form;
        }
    });
    //扩展
    $.validateExtend({
        email: {
            pattern: /^(\w)+(\.\w+)*@(\w)+((\.\w+)+)$/,
            description:{
                required:'请填写邮箱',
                pattern: '邮箱格式不正确'
            }
        },
        //过滤非法字符HTML等
        charsafe: {
            pattern: /^[^\\\/:\*\?\"<>\|]*$/,
            description:{
                required:'请填写邮箱',
                pattern: '不能包含\/:*?"<>|等字符'
            }
        },
        mobile: {
            pattern: /^1\d{10}$/,
            description:{
                required:'请填写手机',
                pattern: '请检查号码是否是11位'
            }
        }
    });
    var describ = function(field, options, msg, cls) {
        var tip = field.data('label');
        if (tip) {
            //如果是#开头的则在全局查找，否则在form下查找
            tip = tip.indexOf('#') == 0 ? $(tip) : options.form.find(tip);
            tip.html(msg);
            return true;
        }
    }
    return function(config) {
        config = $.extend({
            onKeyup: true,
            eachValidField: function(event, status, options, msg) {
                this.removeClass('invalid');
                if (describ(this, options, msg ? '<span class="c-safe"><i class="f f-checkmark"></i> ' + msg + '</span>' : '')) return;
                var id = this.data('_tips_');
                if (id) $('#' + id).hide();
            },
            eachInvalidField: function(event, status, options, msg) {
                if (event.type === 'keyup') return;
                this.addClass('invalid');
                if (msg) {
                    msg = '<i class="f f-warn"></i> ' + msg;
                    if (describ(this, options, '<span class="c-error">' + msg + '</span>')) return;
                    var id = this.data('_tips_');
                    if (!id) this.data('_tips_', id = _.uniqueId('tips_'))
                    tips({
                        id: id,
                        of: this,
                        msg: msg,
                        cls: 'error',
                        dir: this.attr('dir') || 'rc',
                        within: options.tipWithin||options.form
                    });
                }
            }
        }, config);
        var ret = {
            form: $(config.form),
            reset: function() {
                this.form.validate(config).find('.tips').remove();
                return this;
            }
        }
        return ret.reset();
    }
});
