/**
 *  underscore template tag
 *  _.templateSettings = {
 *    evaluate    : /<%([\s\S]+?)%>/g,
 *    interpolate : /<%=([\s\S]+?)%>/g,
 *    escape      : /<%-([\s\S]+?)%>/g
 *  };
 */
_.templateSettings = {
    evaluate: /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    escape: /\{\{-([\s\S]+?)\}\}/g
};
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
//UI基础库,依赖jquery underscore
(function() {
    'use strict';
    //KeyCode
    var keyCode = {
            BACKSPACE: 8,
            TAB: 9,
            COMMA: 188,
            DELETE: 46,
            DOWN: 40,
            END: 35,
            ENTER: 13,
            ESCAPE: 27,
            HOME: 36,
            LEFT: 37
        },
        UI = window.UI = {};

    /**
     * 浏览器判断 主要判断IE6-10
     */
    var browser;
    if (!!window.ActiveXObject) {
        //IE6-10
        browser = {
            ie: window.atob ? 10 : document.addEventListener ? 9 : document.querySelector ? 8 : window.XMLHttpRequest ? 7 : 6
        }
    } else {
        browser = {
            ie11: '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style,
            chrome: !!window.chrome && window.chrome.webstore,
            firefox: !!window.sidebar && !window.sidebar.nodeName, //这是不严谨的
            safari: /constructor/i.test(window.HTMLElement),
            opera: !!window.opera || /opera|opr/i.test(navigator.userAgent)
        };
    }
    UI.browser = browser;

    /**
     * 全局唯一ID ，局部可用_.uniqueId(UI.guid)
     * @type {[type]}
     */
    var noop = $.noop,
        uuid = 0,
        //位数不固定30位左右
        guid = function() {
            var n = _.now().toString(32),
                i;
            for (i = 0; i < 5; i++) {
                n += Math.floor(Math.random() * 65535).toString(32);
            }
            return n + (uuid++).toString(32);
        };
    UI.guid = guid;

    /**
     * 原型链
     * @param  {[type]} proto 原型对象
     * @return {Object}       新对象
     */
    var proto = Object.create || function(proto) {
        function F() {};
        F.prototype = proto;
        return new F;
    };
    UI.proto = proto;

    /**
     * Input Event Fixed
     * jquery plugin
     * IE6\7\8不支持input事件，'onpropertychange' in document
     * IE9比较鸡肋
     */
    if (browser.ie < 10) {
        // 检查是否为可输入元素
        var rinput = /^INPUT|TEXTAREA$/,
            isInput = function(elem) {
                return rinput.test(elem.nodeName);
            };
        $.event.special.input = {
            setup: function() {
                if (!isInput(this)) return false;
                var elem = this,
                    oldValue = this.value,
                    setter = function() {
                        if (oldValue !== elem.value) {
                            oldValue = elem.value;
                            $.event.trigger('input', null, elem);
                        };
                    };
                oldValue = elem.value;

                if (browser.ie == 9) {
                    //删除
                    $.event.add(elem, 'keyup._inputFixed', function(e) {
                        var key = e.originalEvent.keyCode;
                        if (key == 8 || key == 46) {
                            setter();
                        }
                    });
                    //剪切
                    $.event.add(elem, 'cut._inputFixed', function(e) {
                        setTimeout(setter);
                    });
                }
                //ie6-9
                elem.attachEvent('onpropertychange', $.data(elem, '@inputFixed', function(event) {
                    if (event.propertyName.toLowerCase() == "value") {
                        setter();
                    }
                }));

            },
            teardown: function() {
                if (!isInput(this)) return false;
                if (browser.ie == 9) $.event.remove(this, "._inputFixed");
                this.detachEvent('onpropertychange', $.data(this, '@inputFixed'));
                $.removeData(this, '@inputFixed');
            }
        };
    };
    $.fn.input = function(handler) {
        return this.on('input', handler);
    };

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
        worker.fns = fns;
        worker.after = function() {
            fns = fns.concat(_.filter(APS.call(arguments), _.isFunction));
        };
        worker.before = function() {
            fns = _.filter(APS.call(arguments), _.isFunction).concat(fns);
        };
        return worker;
    }
    UI.handler = handler;

    /**
     * 基础加载器
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    var loader = function(config) {
        config = $.extend({
            baseparms: {},
            beforeLoad: $.noop,
            afterLoad: $.noop
        }, config);
        var filter = config.filter,
            baseparms = config.baseparms;
        //分页
        if (baseparms.count && !baseparms.page) baseparms.page = 1;
        return {
            config: config,
            load: function(_filter) {
                config.beforeLoad.call(config, _filter);
                //开启筛选
                if (_filter) {
                    filter = _filter;
                }
                var finalData = $.extend({}, baseparams, filter);
                $.ajax({
                    url: config.url,
                    data: finalData,
                    cache: config.cache,
                    dataType: 'JSON',
                    success: function(data) {
                        config.afterLoad.call(config, data);
                    }
                });
            }
        }
    }
    UI.loader = loader;

    /**
     * 修复浏览器对Object.defineProperties的支持
     * author: avalon
     */
    var defineProperty = Object.defineProperty
        //如果浏览器不支持ecma262v5的Object.defineProperties或者存在BUG，比如IE8只允许DOM对象，safari不允许DOM对象
        //标准浏览器使用__defineGetter__, __defineSetter__实现
    try {
        defineProperty({}, "_", {
            value: "x"
        })
        var defineProperties = Object.defineProperties
    } catch (e) {
        if ("__defineGetter__" in UI) {
            defineProperty = function(obj, prop, desc) {
                if ('value' in desc) {
                    obj[prop] = desc.value
                }
                if ("get" in desc) {
                    obj.__defineGetter__(prop, desc.get)
                }
                if ('set' in desc) {
                    obj.__defineSetter__(prop, desc.set)
                }
                return obj
            }
            defineProperties = function(obj, descs) {
                for (var prop in descs) {
                    if (descs.hasOwnProperty(prop)) {
                        defineProperty(obj, prop, descs[prop])
                    }
                }
                return obj
            }
        }
    }
    //IE6-8使用VBScript类的set get语句实现
    if (!defineProperties && window.VBArray) {
        alert('2')
        window.execScript([
            "Function parseVB(code)",
            "\tExecuteGlobal(code)",
            "End Function",
            "Dim VBClassBodies",
            "Set VBClassBodies=CreateObject(\"Scripting.Dictionary\")",
            "Function findOrDefineVBClass(name,body)",
            "\tDim found",
            "\tfound=\"\"",
            "\tFor Each key in VBClassBodies",
            "\t\tIf body=VBClassBodies.Item(key) Then",
            "\t\t\tfound=key",
            "\t\t\tExit For",
            "\t\tEnd If",
            "\tnext",
            "\tIf found=\"\" Then",
            "\t\tparseVB(\"Class \" + name + body)",
            "\t\tVBClassBodies.Add name, body",
            "\t\tfound=name",
            "\tEnd If",
            "\tfindOrDefineVBClass=found",
            "End Function"
        ].join("\n"), "VBScript")

        var VBMediator = function(accessingProperties, name, value) {
            var accessor = accessingProperties[name]
            if (typeof accessor === "function") {
                if (arguments.length === 3) {
                    accessor(value)
                } else {
                    return accessor()
                }
            }
        }
        defineProperties = function(name, accessors, properties) {
            var className = "VBClass" + setTimeout("1"),
                buffer = []
            buffer.push(
                    "\r\n\tPrivate [__data__], [__proxy__]",
                    "\tPublic Default Function [__const__](d, p)",
                    "\t\tSet [__data__] = d: set [__proxy__] = p",
                    "\t\tSet [__const__] = Me", //链式调用
                    "\tEnd Function")
                //添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
            for (name in properties) {
                if (!accessors.hasOwnProperty(name)) {
                    buffer.push("\tPublic [" + name + "]")
                }
            }
            $$skipArray.forEach(function(name) {
                if (!accessors.hasOwnProperty(name)) {
                    buffer.push("\tPublic [" + name + "]")
                }
            })
            buffer.push("\tPublic [" + 'hasOwnProperty' + "]")
                //添加访问器属性 
            for (name in accessors) {
                buffer.push(
                    //由于不知对方会传入什么,因此set, let都用上
                    "\tPublic Property Let [" + name + "](val" + expose + ")", //setter
                    "\t\tCall [__proxy__]([__data__], \"" + name + "\", val" + expose + ")",
                    "\tEnd Property",
                    "\tPublic Property Set [" + name + "](val" + expose + ")", //setter
                    "\t\tCall [__proxy__]([__data__], \"" + name + "\", val" + expose + ")",
                    "\tEnd Property",
                    "\tPublic Property Get [" + name + "]", //getter
                    "\tOn Error Resume Next", //必须优先使用set语句,否则它会误将数组当字符串返回
                    "\t\tSet[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                    "\tIf Err.Number <> 0 Then",
                    "\t\t[" + name + "] = [__proxy__]([__data__],\"" + name + "\")",
                    "\tEnd If",
                    "\tOn Error Goto 0",
                    "\tEnd Property")

            }

            buffer.push("End Class")
            var code = buffer.join("\r\n"),
                realClassName = window['findOrDefineVBClass'](className, code) //如果该VB类已定义，返回类名。否则用className创建一个新类。
            if (realClassName === className) {
                window.parseVB([
                    "Function " + className + "Factory(a, b)", //创建实例并传入两个关键的参数
                    "\tDim o",
                    "\tSet o = (New " + className + ")(a, b)",
                    "\tSet " + className + "Factory = o",
                    "End Function"
                ].join("\r\n"))
            }
            var ret = window[realClassName + "Factory"](accessors, VBMediator) //得到其产品
            return ret //得到其产品
        }
    }
    UI.defineProperties = defineProperties;


})();
//更新cable2 增加col类配置render
//金额计算
//position
//removeable
//dragable
//resizeable
//selectable
//sortable
