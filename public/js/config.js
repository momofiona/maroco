//seajs config2
seajs.config({
    alias: {
        "mock": "js/mock.js"||"http://mockjs.com/dist/mock.js"
    },
    paths: {
        'apps': '../apps'
    },
    vars: {
        'locale': 'cn'
    },
    'map': [
        [/^(.*\.(?:css|js))(.*)$/i, '$1?20140411']
    ]
});
//underscore template
