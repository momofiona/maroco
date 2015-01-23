define(function(require, exports, module) {
    var $ = require('jquery');
    require('css/zTree/zTreeStyle.css');
    require('js/vendor/zTree/jquery.ztree.all-3.5.min.js');
    exports.show = function(option) {
        var dialog = $('<div class="ztree">').dialog({
            title: '选择部门(按住 Ctrl 可多选)',
            width: 400,
            modal: true,
            height: 400,
            beforeClose: function() {
                $(this).dialog('destroy');
            },
            buttons: [{
                text: '确定',
                'class': 'cui-button-blue',
                //disabled:true,
                click: function() {
                    var selected = orgTree.getSelectedNodes();
                    option.onselected && option.onselected(selected);
                    $(this).dialog('close');
                }
            }, {
                text: '取消',
                click: function() {
                    $(this).dialog('close');
                }
            }]
        });
        //ztree
        var orgTree;
        var setting = {
            data: {
                simpleData: {
                    enable: true,
                    idKey: 'id',
                    pIdKey: 'pid',
                    RootPid: 'ROOT'
                }
            }
        };
        $.ajax({
            url: UI.server + "user/getTree",
            dataType: 'json',
            data: {
                enterpriseId: option.enterpriseId || ''
            },
            success: function(v) {
                var zNodes = v.result;
                $.each(zNodes, function(i, o) {
                    o.icon = UI.server + 'img/org-s.png';
                });
                orgTree = $.fn.zTree.init(dialog, setting, zNodes);
                orgTree.expandAll(true);
            }
        });

    }
});
