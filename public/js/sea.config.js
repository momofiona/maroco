//seajs config2
seajs.config({
    alias: {
        ztree: 'js/vendor/zTree/jquery.ztree.all-3.5.min.js',
        ztreeCSS: 'css/zTree/zTreeStyle.css',
        my97: 'js/vendor/my97/WdatePicker.js',
        zrender: 'js/vendor/eCharts/zrender/zrender.js'
    },
    paths: {
        'ui': 'js/ui',
        'zrender': 'js/vendor/eCharts/zrender',
        'echarts': 'js/vendor/eCharts/echarts'
    },
    vars: {
        'locale': 'cn'
    },
    map: [
        [/^(.*\.(?:css|js))(.*)$/i, '$1?20150101']
    ]
});