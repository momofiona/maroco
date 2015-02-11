define(function(require, exports, module) {
    var notify = require('ui/notify');
    require('css/zTree/zTreeStyle.css');
    require('js/vendor/zTree/jquery.ztree.all-3.5.min.js');
    exports.show = function(option) {
        var orgTree,
            dialog = notify({
                title: '选择部门(按住 Ctrl 可多选)',
                draggable: true,
                resizable: true,
                mask: true,
                width:400,
                maxHeight:300,
                oncreate: function() {
                    var _t=this;
                    var ztree=$('<ul class="scroll ztree">').appendTo(this.contentEl.addClass('p0'));
                    //ztree
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
                        url: '/json/getTree',
                        dataType: 'json',
                        data: {
                            enterpriseId: option.enterpriseId || ''
                        },
                        success: function(v) {
                            var zNodes = v.result;
                            $.each(zNodes, function(i, o) {
                                // o.icon = 'f f-org';
                            });
                            orgTree = $.fn.zTree.init(ztree, setting, zNodes);
                            orgTree.expandAll(true);
                            _t.el.position(_t.position);
                        }
                    });
                },
                buttons: [{
                    label: '确定',
                    cls: 'error',
                    click: function(e, config) {
                        var selected = orgTree.getSelectedNodes();
                        option.onselected && option.onselected(selected);
                        debugger;
                        config.close();
                    }
                }, {
                    label: '关闭',
                    cls: 'silver dialog-close'
                }]
            });

    }
});
