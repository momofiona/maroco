/* https://github.com/DiegoLopesLima/Validate */
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
        conditional: {},
        // Prepare functions
        prepare: {},
        // Fields descriptions
        description: {},
        // Callback
        eachField: $.noop,
        // Callback
        eachInvalidField: $.noop,
        // Callback
        eachValidField: $.noop,
        // Callback
        invalid: $.noop,
        // Callback
        valid: $.noop,
        // A fielter to the fields
        filter: '*'
    }


    var type = ['input:not([type]),input[type="color"],input[type="date"],input[type="datetime"],input[type="datetime-local"],input[type="email"],input[type="file"],input[type="hidden"],input[type="month"],input[type="number"],input[type="password"],input[type="range"],input[type="search"],input[type="tel"],input[type="text"],input[type="time"],input[type="url"],input[type="week"],textarea', 'select', 'input[type="checkbox"],input[type="radio"]'],

        // All field types
        allTypes = type.join(','),

        extend = {
            trim: true
        },

        // Method to validate each fields
        validateField = function(event, options) {
            var status = {
                    pattern: true,
                    conditional: true,
                    required: true
                },

                // Current field
                field = $(this),
                // Current field value
                fieldValue = field.val() || '',
                // An index of extend
                fieldValidate = field.data('validate'),
                // A validation object (jQuery.fn.validateExtend)
                validation = extend[fieldValidate] || {},
                // One index or more separated for spaces to prepare the field value
                fieldPrepare = field.data('prepare') || validation.prepare,
                // A regular expression to validate field value
                fieldPattern = (field.data('pattern') || ($.type(validation.pattern) == 'regexp' ? validation.pattern : /(?:)/)),
                // Is case sensitive? (Boolean)
                fieldIgnoreCase = field.attr('data-ignore-case') || field.data('ignoreCase') || validation.ignoreCase,
                // A field mask
                fieldMask = field.data('mask') || validation.mask,
                // A index in the conditional object containing a function to validate the field value
                fieldConditional = field.data('conditional') || validation.conditional,
                // Is required?
                fieldRequired = field.data('required'),
                // An index of description object
                fieldDescription = field.data('description') || field.attr('name'),
                // Trim spaces? 
                fieldTrim = field.data('trim'),
                reTrue = /^(true|)$/i,
                reFalse = /^false$/i,

                // The description object 
                fieldDescription=options.description[fieldDescription]||validation.description||{};

                name = 'validate';

            fieldRequired = fieldRequired != '' ? (fieldRequired || !!validation.required) : true;

            fieldTrim = fieldTrim != '' ? (fieldTrim || !!validation.trim) : true;

            // Trim spaces?
            if (reTrue.test(fieldTrim)) {

                fieldValue = $.trim(fieldValue);
            }

            // The fieldPrepare is a function?
            if ($.isFunction(fieldPrepare)) {

                // Updates the fieldValue variable
                fieldValue = String(fieldPrepare.call(field, fieldValue));
            } else {

                // Is a function?
                if ($.isFunction(options.prepare[fieldPrepare])) {

                    // Updates the fieldValue variable
                    fieldValue = String(options.prepare[fieldPrepare].call(field, fieldValue));
                }
            }

            // Is not RegExp?
            if ($.type(fieldPattern) != 'regexp') {

                fieldIgnoreCase = !reFalse.test(fieldIgnoreCase);

                // Converts to RegExp
                fieldPattern = fieldIgnoreCase ? RegExp(fieldPattern, 'i') : RegExp(fieldPattern);
            }

            // The conditional exists?
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

            fieldRequired = reTrue.test(fieldRequired);

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
            }

            // Verifies the field type
            if (field.is(type[0])) {

                // Test the field value pattern
                if (fieldPattern.test(fieldValue)) {

                    // If the event type is not equals to keyup
                    if (event.type != 'keyup' && fieldMask !== undefined) {

                        var matches = fieldValue.match(fieldPattern);

                        // Each characters group
                        for (var i = 0, len = matches.length; i < len; i++) {

                            // Replace the groups
                            fieldMask = fieldMask.replace(RegExp('\\$\\{' + i + '(?::`([^`]*)`)?\\}', 'g'), (matches[i] !== undefined ? matches[i] : '$1'));
                        }

                        fieldMask = fieldMask.replace(/\$\{\d+(?::`([^`]*)`)?\}/g, '$1');

                        // Test the field value pattern
                        if (fieldPattern.test(fieldMask)) {

                            // Update the field value
                            field.val(fieldMask);
                        }
                    }
                } else {

                    // If the field is required
                    if (fieldRequired) {

                        status.pattern = false;
                    } else {

                        if (fieldValue.length > 0) {

                            status.pattern = false;
                        }
                    }
                }
            }
            var log = fieldDescription.valid;
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

                    validation.valid.call(field, event, status, options, log);
                }

                // Call the eachValidField callback
                options.eachValidField.call(field, event, status, options, log);
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
            pattern: /^[^\\\/:\*\?\"<>\|]*$/
        },
        mobile: {

        }
    });
    var describ = function(field, options, msg, cls) {
        var tip = field.data('describedby');
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
                        within: options.form
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
