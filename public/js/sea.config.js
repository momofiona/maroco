//seajs config2
seajs.config({
    alias: {
        ztree: 'js/vendor/zTree/jquery.ztree.all-3.5.min.js',
        ztreeCSS: 'css/zTree/zTreeStyle.css',
        my97: 'js/vendor/my97/WdatePicker.js',
        draggable: 'js/vendor/jqueryui/jquery.ui.draggable.min.js',
        sortable: 'js/vendor/jqueryui/jquery.ui.sortable.min.js',
        mousewheel:'js/vendor/jquery.mousewheel.min',
        moment:'js/vendor/moment/moment.min.js'
    },
    paths: {
        'ui': 'js/ui'
    },
    vars: {
        'locale': 'cn'
    },
    map: [
        [/^(.*\.(?:css|js))$/i, "$1?20151125"]
    ]
});