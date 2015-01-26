/**
 * API mock
 */
define(function(require, exports, module) {
    var Mock = require('js/vendor/mock-min.js');
    //test
    Mock.mock('/json/members', 'get', {
        "total|200": 12,
        "result|2-10": [{
            'id|+1': 12,
            "cname": '@WORD',
            "address": "@TITLE",
            "thumb": '@IMAGE',
            "from": '@STRING(3,8)',
            "sender": '@NAME',
            "sendtime": '@DATE("yyyy-MM-dd hh:mm:ss")'
        }]
    });
    //组织树
    /*[{
        id: top.USER.orgId,
        isParent: true,
        leaf: false,
        name: top.USER.orgName
    }]*/
    Mock.mock('/json/getTree', 'get', {
        "total|200": 12,
        "result|2-10": [{
            'id|+1': 12,
            "isParent": true,
            "leaf": false,
            "name": '@NAME'
        }]
    });
    ///json/getUserByOrgId 获取部门下人员
    Mock.mock('/json/getUserByOrgId', 'get', {
        "total|200": 12,
        "result|20": [{
            'id|+1': 12,
            "sex|1": true,
            "userName": '@WORD',
            "loginName": "@WORD",
            "thumb": '@IMAGE',
            "position": '@WORD',
            "reserveA": '@WORD',
            "mobile|11": 1,
            "email": '@EMAIL',
            "sendtime": '@DATE("yyyy-MM-dd hh:mm:ss")'
        }]
    });
    
});
