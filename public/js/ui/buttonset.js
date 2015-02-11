/**
 * buttonset
 */
define(function(require, exports, module) {
    var watch = require('ui/watch');
    var defaults = {
        cls: 'link',
        events: {
            'click .b': function(e, config) {
                var ac = config.cls + '-active active',
                    data = config.data[$(this).attr('index')];
                if (config.multi) {
                    data.on=!data.on;
                    $(this).toggleClass(ac,data.on).removeClass(config.cls + '-hover');
                } else {
                    //如果已经选中了就不要再次执行
                    if(data.on) return;
                    _.each(config.data, function(o, i) {
                        o.on = false;
                    });
                    data.on = true;
                    $(this).addClass(ac).siblings().removeClass(ac);
                }
                if (config.onselect) config.onselect.call(this, e, config, data);
                return false;
            }
        },
        getSelected: function() {
            return _.filter(this.data, function(o, i) {
                return o.on
            });
        }
    }
    var tmp = _.dot('{{~it.data :v:i}}<b index="{{=i}}" class="b {{=it.cls}}{{?v.on}} {{=it.cls}}-active{{?}}">{{=v.label}}</b>{{~}}');
    return function(config) {
        config = _.extend(_.proto(defaults), config);
        UI(config);
        if (config.data) {
            config.el.html(tmp(config));
        } else {
            var _d = config.data = [];
            config.el.children('.b').each(function(i, o) {
                _d.push({
                    on: $(o).attr('index', i).hasClass('active'),
                    label: $(o).text()
                });
            })
        }
        //IE6禁止复制
        if (UI.browser.ie == 6) {
            config.el.children().each(function() {
                this.onselectstart = function() {
                    return false;
                }
            });
        }
        return config;
    }
});
