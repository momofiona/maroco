define(function(require, exports, module) {
    $.fn.searchbox = function(option) {
        if (this.length != 1) return this;
        var filter, oldValue;
        UI($.extend({
            value: '',
            el: this,
            cls: 'searchbox',
            placeholder: '',
            delay: 500,
            events: {},
            search: $.noop,
            input: $.noop,
            init: function() {
                var t = this;
                t.el.addClass(t.cls).html('<input value="' + t.value + '" class="text" placeholder="' + t.placeholder + '"><i class="i i-cancel am-rotate"></i>');

                //如果带了分类选择
                if (t.filter) {
                    t.events['click .ac-filter'] = function(e, conf) {
                        filter = conf.filter[$(this).attr('index')];
                        t.tip.html(filter.label);
                        conf.el.css('padding-left', t.tip.outerWidth() + 35);
                        t.tip.dropdown('hide');
                        return false;
                    }
                    var s = "";
                    _.each(this.filter, function(o, i) {
                        s += '<li><a index="' + i + '" href="#" class="ac-filter ' + o.cls + '">' + o.label + '</a></li>';
                    });
                    t.tip = $('<a href="#" class="search-filter" data-dropdown></a>').prependTo(t.el);
                    t.dropdown = $('<div class="dropdown" position="left top,left-25 bottom"><ul class="menu">' + s + '</ul></div>').insertAfter(t.tip);
                }

                var input = t.el.find('input'),
                    cancel = input.next().click(function() {
                        $(this).hide();
                        input.val('').focus();
                        input.trigger('input');
                        t.search.call(input, '', filter);
                    });
                if (oldValue = t.value) cancel.show();
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
                });
            },
            create: function() {
                this.filter && this.dropdown.find('a:eq(0)').click();
            }
        }, option));
        return this;
    }
});
