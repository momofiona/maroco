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
            "avanta": '@IMAGE',
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
            'id': '@GUID',
            "sex|0-1": 1,
            "userName": '@WORD',
            "loginName": "@WORD",
            "avanta": '@IMAGE',
            "address": '@AREA @REGION',
            "cardId": '@ID',
            "position": [{
                orgId: '@GUID',
                orgName: '@WORD',

            }],
            "reserveA": '@WORD',
            "mobile|11": 1,
            "email": '@EMAIL',
            "sendtime": '@DATE("yyyy-MM-dd hh:mm:ss")'
        }]
    });

    //根据用户ID获取用户所有可获得的权限列表
    Mock.mock('/json/getPowerByUserId', 'get', {
        "result|1-2": [{
            "orgName": '@WORD', //所属部门或者组织
            "orgId": '@GUID',
            "roles|2-4": [{
                "id": "@GUID",
                "name": "@WORD",
                "power":'@boolean',
                "description": '@WORD'
            }]
        }]
    });

});
