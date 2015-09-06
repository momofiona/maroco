/**
 * buttonset 
 */
define(function(require, exports, module) {
    var defaults = {
        cls: 'link',
        events: {
            'click .b': function(e, config) {
                var ac = config.cls + '-active active',
                    data = config.data[$(this).attr('index')];
                if (config.multi) {
                    data.on = !data.on;
                    $(this).toggleClass(ac, data.on).removeClass(config.cls + '-hover');
                } else {
                    //如果已经选中了就不要再次执行
                    if (data.on) return;
                    _.each(config.data, function(o, i) {
                        o.on = false;
                    });
                    data.on = true;
                    $(this).addClass(ac).siblings().removeClass(ac);
                }
                if (config.onselect) config.onselect.call(this, e, config, data);
            }
        },
        tmp:_.dot('{{~it.data :v:i}}<b index="{{=i}}"{{?v.title}} title="{{=v.title}}"{{?}} class="b {{=v.cls||""}} {{=it.cls}}{{?v.on}} {{=it.cls}}-active active{{?}}">{{=v.label}}</b>{{~}}'),
        init: function() {
            this.el.addClass('group');
            if (this.data) {
                this.el.html(this.tmp(this));
            } else {
                var _d = this.data = [];
                this.el.children('.b').each(function(i, o) {
                    _d.push({
                        on: $(o).attr('index', i).hasClass('active'),
                        label: $(o).text()
                    });
                });
            }
            //IE6禁止复制
            if (UI.browser.ie == 6) {
                this.el.children().each(function() {
                    this.onselectstart = function() {
                        return false;
                    }
                });
            }
        },
        getSelected: function() {
            return _.filter(this.data, function(o, i) {
                return o.on
            });
        }
    }
    return function(config) {
        return UI(_.create(defaults,config));
    }
});
