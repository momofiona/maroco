/*
 code
 1  未指明错误
 */
var AjaxResult = function() {
    this.result = {};
};
AjaxResult.prototype = {
    //1-999 系统保留错误号
    defaults: {
        '1': '未指明错误',
        '2': '未登录',
        '3': '没有权限'
    },
    error: function(error) {
        //如果是数字
        var msg = this.defaults[error];
        if (msg) {
            this.result.msg = msg;
            this.result.code = +error;
        } else {
            this.result.msg = error;
            this.result.code = 1;
        }
        return this.stringify();
    },
    success: function(data) {
        this.result.data = data;
        return this.stringify();
    },
    stringify: function() {
        return JSON.stringify(this.result);
    },
    //注册错误号，号段约定：一个功能模块错误号=模块序号+000，
    regiest:function(errors){
        for(i in errors){
            if(+i>10000){
                this.defaults[i]=errors[i];
            }
        }
    }
};
module.exports = AjaxResult;
