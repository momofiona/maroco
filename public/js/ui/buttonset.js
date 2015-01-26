/**
 * buttonset
 */
define(function(require, exports, module) {
    var watch = require('ui/watch');
    var defaults = {
        cls: 'link',
        events: {
            'click .b': function(e, config) {
                var ac = config.cls + '-active active';
                if(config.multi){
                    $(this).toggleClass(ac).removeClass(config.cls+'-hover');
                }else{
                    $(this).addClass(ac).siblings().removeClass(ac);
                }
                if (config.onselect) config.onselect.call(this, e, config);
            }
        },
        getSelected: function() {
            return this.el.children().filter('.active');
        },
        getSelectData: function() {
            var out=[],data=this.data;
            if(!data){
                return out;
            }
            this.el.children().each(function(i,o){
                if($(o).hasClass('active')) out.push(data[i]);
            });
            return out;
        }
    }
    var tmp = _.dot('{{~it.data :v:i}}<b class="b {{=it.cls}}{{?v.selected}} {{=it.cls}}-active{{?}}">{{=v.label}}</b>{{~}}');
    return function(config) {
        config = _.extend(_.proto(defaults), config);
        UI(config);
        if(config.data){
            config.el.html(tmp(config));
        }
        //IE6禁止复制
        if(UI.browser.ie==6){
            config.el.children().each(function(){
                this.onselectstart=function(){return false;}
            });
        }
        return config;
    }
});
