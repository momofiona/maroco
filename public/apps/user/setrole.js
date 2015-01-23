define(function(require, exports, module) {
    var $ = require('jquery');
    var dot = require('dot');
    var form = '<form class="cp-l">{{~it :v:i}}\
    <label><input type="checkbox" value="{{=v.id}}"> {{=v.roleName}}</label>\
    {{~}}</form><span class="cui-btn cui-button-blue cui-btn-l">保存</span>';
    var notify = require('js/notify');

    exports.show = function(opt) {
        $.when($.ajax("../role/getRoleList"), $.ajax("../user/getUserRoles?userId="+opt.userId)).done(function(roles, userRole) {
            var temp = dot.template(form)(roles[0].result);
            var vform = $(temp).appendTo(opt.container.empty());
            vform.find('.cui-btn').click(function() {
                var selectedRoles = [];
                vform.find(':checked').each(function() {
                    selectedRoles.push(this.value);
                });
                $.post('../user/createOrgUser', {
                    userId: opt.userId,
                    roles: selectedRoles.join()
                }, function(data) {
                    opt.saved&&opt.saved.call(vform,data);
                });
            });
            opt.callback && opt.callback.call(vform, roles[0].result,userRole[0].result);
        });
    }
});
