define(function(require, exports, module) {
    var notify = require('ui/notify');
    require('css/zTree/zTreeStyle.css');
    require('js/vendor/zTree/jquery.ztree.all-3.5.min.js');
    exports.show = function(option) {
        var orgTree,
            dialog = notify({
                title: '选择部门(按住 Ctrl 可多选)',
                draggable: true,
                mask: true,
                width: 400,
                height: 300,
                oncreate: function() {
                    var _t = this;
                    var ztree = $('<ul class="ztree">').appendTo(this.contentEl.addClass('p0'));
                    //ztree
                    var setting = {
                        async: {
                            url: '/json/getTree',
                            enable: true,
                            autoParam: ["id"],
                            dataFilter: function(treeId, parentNode, responseData) {
                                return responseData.result;
                            },
                            dataType: 'json',
                            type: 'get'
                        },
                        view: {
                            selectedMulti: true
                        },
                        callback: {
                            onClick: function(event, treeId, treeNode) {

                                // userManeger.renderUser(treeNode);
                            }
                        }
                    };
                    orgTree = $.fn.zTree.init(ztree, setting);
                    _t.el.position(_t.position);
/*                    $.ajax({
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
                        }
                    });*/
                },
                buttons: [{
                    label: '确定',
                    cls: 'error',
                    click: function(e, config) {
                        var selected = orgTree.getSelectedNodes();
                        if(selected.length==0){
                            notify.warn('您还没有选择任何一个部门');
                            return;
                        }
                        option.onselected && option.onselected(selected);
                        config.close();
                    }
                }, {
                    label: '关闭',
                    cls: 'silver dialog-close'
                }]
            });

    }
});
