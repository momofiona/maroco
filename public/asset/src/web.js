//依赖 jquery 和 underscore
define(function(require, exports, module) {
    'use strict';
    var $ = require('jquery');
    var watch = require('./watch');
    //键盘KeyCode
    var keyCode = {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
      };

    //浏览器种类
    var browers = {
        ie: !!window.ActiveXObject,
        ie6: document.all && !window.XMLHttpRequest,
        ie7: document.all && window.XMLHttpRequest && !document.querySelector,
        ie8: document.all && document.querySelector && !document.addEventListener,
        ie9: document.all && document.addEventListener && !window.atob,
        ie10: document.all && window.atob,
        ie11: '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style,
        chrome: !!window.chrome && window.chrome.webstore,
        firefox: !!window.sidebar,
        safari: /constructor/i.test(window.HTMLElement),
        opera: !!window.opera || /opera|opr/i.test(navigator.userAgent)
    };
    exports.browers = browers;

    //空对象 类似$.noop 和 _.noop;
    var noop = function() {},
        //uuid 类似$.guid
        uuid = 0,
        guid = function() {
            var n = _.now().toString(32),
                o;
            for (o = 0; o < 5; o++) {
                n += Math.floor(Math.random() * 65535).toString(32);
            }
            return n + (uuid++).toString(32);
        };
    exports.guid = guid;

    /**
     * create object
     * @param  {[type]} proto 原型对象
     * @return {Object}       新对象
     */
    function createObject(proto) {
        if (Object.create) {
            return Object.create(proto);
        }
        function F() {};
        F.prototype = proto;
        return new F;
    };
    exports.createObject = createObject;

    /**
     * 监控输入框变化
     * @param  {[type]}   input    input or textarea
     * @param  {Function} handler  trigger when input but not on parst for all browers
     * @return {[type]}            [description]
     */
    var onInput = function(input, handler) {
        var oldValue = input.value;
        $(input).on('input propertychange', function(e) {
            if (oldValue !== this.value && (e.type !== "propertychange" || e.originalEvent.propertyName.toLowerCase() === "value")) {
                handler.call(input, oldValue, this.value);
                oldValue = this.value;
            }
        }).on('keyup', function(e) {
            //ie9 处理backspace delete
            if ((e.keyCode == keyCode.BACKSPACE || e.keyCode == keyCode.DELETE) && browers.ie9) {
                if (oldValue !== this.value) {
                    handler.call(input, this.value, oldValue);
                    oldValue = this.value;
                }
            }
        });
    }
    exports.onInput = onInput;

    /**
     * 事件注册机
     * @example
     * var a=handler(fn);
     * a.before(fn);
     * a.after(fn);
     */
    var handler = function() {
        var APS = Array.prototype.slice,
            fns = _.filter(APS.call(arguments), _.isFunction),
            worker = function() {
                _.each(fns, function(o, i) {
                    o.apply(this, arguments);
                }, this);
            };
        worker.after = function() {
            fns=fns.concat(_.filter(APS.call(arguments), _.isFunction));
        };
        worker.before = function() {
            fns=_.filter(APS.call(arguments), _.isFunction).concat(fns);
        };
        return worker;
    }
    exports.handler = handler;


});
//更新cable2 增加col类配置render
//金额计算
//position
//removeable
//dragable
//resizeable
//selectable
//sortable
