define(function(require, exports, module) {
    var template = _.dot(require('./user.html'));
    exports.show = function(opt) {
        //人员信息
        var man = UI({
            events: {
                'click .ac-back': 'destroy'
            },
            destroy: function(e, config) {
                config = config || this;
                opt.destroy();
            },
            init: function() {
                this.el.addClass('m').html(template(opt)).appendTo(opt.container);
            }
        });
        //角色信息
        var powers = UI({
            events: {
                'change input': "changed",
                'click .ac-power-save':'post',
                'click h3':function(e,config){
                    var _t=$(this),next=_t.next();
                    if(_t.hasClass('closed')){
                        next.slideDown();
                        _t.find('i').removeClass('rotate3');
                    }else{
                        next.slideUp();
                        _t.find('i').addClass('rotate3');
                    }
                    _t.toggleClass('closed');
                }
            },
            roles: {},
            changed: function(e, config) {
                console.log(this.value,this.checked)
                config.saveEl.show();
                config.roles[this.value] = this.checked;
            },
            render: function() {
                this.el.html(this.template(this.data));
            },
            post:function(){
                console.log(this.roles);
            },
            saveEl:man.$('.ac-power-save').hide(),
            el: man.$('.ac-powers'),
            template: _.dot('{{for (var key in it){ }}\
            <h3><i class="m2 f f-down2"></i>{{=it[key].orgName}}</h3>\
            <ul class="menu">{{~it[key].roles :v:i}}\
            <li style="padding:5px 10px;"><label><input type="checkbox" value="{{=v.id}}"{{?v.power}} checked{{?}}> {{=v.name}}</label></li>\
            {{~}}</ul>\
            {{}}}'),
            init: function() {
                var _t = this;
                $.ajax({
                    url: "/json/getPowerByUserId",
                    dataType: 'json',
                    success: function(v) {
                        _t.data = v.result;
                        _t.render();
                    }
                })
            }
        });

    }
});
