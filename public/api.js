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
    Mock.mock(/\/json\/getTree(\?.*)?/, 'get', {
            "total|200": 12,
            "result|5-6": [{
                'id|+1': 12,
                "isParent": "@BOOLEAN",
                "name": '@NAME'
            }]
        });
    ///json/getUserByOrgId 获取部门下人员
    Mock.mock('/json/getUserByOrgId', 'get', {
        "total|200": 12,
        "result|20": [{
            'id': '@GUID',
            "sex|0-1": '@integer',
            "userName": '@WORD',
            "loginName": "@WORD",
            "avanta": '@IMAGE',
            "address": '@AREA @REGION',
            "cardId": '@ID',
            "orgs": [{
                orgId: 'org1',
                orgName: '@WORD'
            }, {
                orgId: 'org2',
                orgName: '@WORD'
            }],
            "roles": [{
                "id": "@GUID",
                "name": "@WORD",
                "power": '@boolean',
                "description": '@WORD',
                "orgName": '部门:@WORD', //所属部门或者组织
                "orgId": '@GUID'
            }, {
                "id": "@GUID",
                "name": "@WORD",
                "power": '@boolean',
                "description": '@WORD',
                "orgName": '部门:@WORD', //所属部门或者组织
                "orgId": '@GUID'
            }],
            "reserveA": '@WORD',
            "mobile": "1@STRING('number',10,10)",
            "email": '@EMAIL',
            "sendtime": '@DATE("yyyy-MM-dd hh:mm:ss")'
        }]
    });

    //根据组织ID返回所有权限
    Mock.mock(/\/json\/getRoleByOrgId(\?.*)?/, 'get', {
        "result|2-5": [{
            "id": "@GUID",
            "name": "@WORD",
            "power": '@boolean',
            "description": '@WORD',
            "orgName": '部门:@WORD', //所属部门或者组织
            "orgId": 'org1'
        }, {
            "id": "@GUID",
            "name": "@WORD",
            "power": '@boolean',
            "description": '@WORD',
            "orgName": '部门:@WORD', //所属部门或者组织
            "orgId": 'org2'
        }]
    });

});
