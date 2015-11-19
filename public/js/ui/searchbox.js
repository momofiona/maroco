define(function(require, exports, module) {
    'use strict';
    return function(option) {
        var filter, oldValue;
        return UI($.extend({
            value: '',
            el: this,
            cls: 'searchbox',
            placeholder: '',
            delay: 500,
            events: {},
            search: $.noop,
            focus: $.noop,
            input: $.noop,
            init: function() {
                var t = this;
                t.el.attr('tabindex', -1).addClass(t.cls).html('<input value="' + t.value + '" class="text" placeholder="' + t.placeholder + '"><i class="i i-cancel am-rotate"></i>');

                //如果带了分类选择
                if (t.filter) {
                    t.events['click .ac-filter'] = function(e, conf) {
                        filter = conf.filter[$(this).attr('index')];
                        t.tip.html('<i class="f f-search m2"></i>' + filter.label);
                        conf.el.css('padding-left', t.tip.outerWidth() + 10);
                        t.tip.dropdown('hide');
                        return false;
                    }
                    var s = "";
                    _.each(this.filter, function(o, i) {
                        s += '<li><a index="' + i + '" href="#" class="ac-filter ' + o.cls + '">' + o.label + '</a></li>';
                    });
                    t.tip = $('<a href="#" class="search-filter" data-dropdown></a>').prependTo(t.el);
                    t.dropdown = $('<div class="dropdown noshadow"  position="left top,left-1 bottom"><ul class="menu">' + s + '</ul></div>').insertAfter(t.tip);
                }

                var input = t.el.find('input'),
                    cancel = input.next().click(function() {
                        $(this).hide();
                        input.val('').focus();
                        input.trigger('input');
                        t.search.call(input, '', filter);
                    });
                //reset
                t.reset = function() {
                    cancel.hide();
                    input.val('');
                };

                if (oldValue = t.value) {
                    cancel.show();
                }
                var callInput = function(input, value, filter) {
                    if (oldValue !== value) {
                        t.input.call(input, value, filter);
                        oldValue = value;
                    }
                };
                if (t.delay) {
                    callInput = _.throttle(callInput, t.delay, {
                        leading: false
                    });
                }
                input.on('input', function() {
                    var value = $.trim(this.value);
                    callInput(input, value, filter);
                    cancel.toggle(!!value);
                }).on('keyup', function(e) {
                    if (e.keyCode == "13") {
                        t.search.call(input, this.value, filter);
                    }
                }).focus(function() {
                    t.el.addClass('searchbox-focus');
                    t.focus(true);
                }).blur(function() {
                    t.el.removeClass('searchbox-focus');
                    t.focus();
                });
            },
            create: function() {
                this.filter && this.dropdown.find('a:eq(0)').click();
            }
        }, option));
    }
});
