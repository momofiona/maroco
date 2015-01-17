/**
 * API mock
 */
define(function(require, exports, module) {
    var Mock = require('js/vendor/mock-min.js');
    //test
    Mock.mock('json/members', 'get', {
        "total|200": 12,
        "result|10": [{
            'id|+1': 12,
            "cname": '@WORD',
            "address": "@TITLE",
            "thumb": '@IMAGE',
            "from": '@STRING(3,8)',
            "sender": '@NAME',
            "sendtime": '@DATE("yyyy-MM-dd hh:mm:ss")'
        }]
    });
});
