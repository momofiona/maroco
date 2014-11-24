//seajs config
seajs.config({
    alias: {
        "mock": "js/mock.js"||"http://mockjs.com/dist/mock.js"
    },
    paths: {
        'site': '/static/apps'
    },
    vars: {
        'locale': 'cn' //cn|tw|jp|en
    },
    'map': [
        //客户端版本号
        [/^(.*\.(?:css|js))(.*)$/i, '$1?20140411']
    ]
});