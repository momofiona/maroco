/**
 *  underscore template tag
 */
_.templateSettings = {
    evaluate: /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    escape: /\{\{-([\s\S]+?)\}\}/g
};

//seajs config2
seajs.config({
    alias: {},
    paths: {
        'apps': '../apps'
    },
    base: seajs.resolve('/'),
    vars: {
        'locale': 'cn'
    },
    map: [
        [/^(.*\.(?:css|js))(.*)$/i, '$1?20150101']
    ]
});

//console fix，生产环境用uglify去掉console
(function() {
    if (window.console) return;
    var methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeStamp', 'trace', 'warn'
        ],
        length = methods.length,
        console = window.console = {};
    while (length--) {
        console[methods[length]] = $.noop;
    }
})();

//UI base
(function($) {
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
            //hack需要 ie6-8 因为需要排除IE9来加filter
        $('html').addClass('ie' + browser.ie+(browser.ie<9?' ie6-8':''));
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

    define('ui', function(require) {
        require('api'); //注掉此行来禁用假数据
        return UI;
    });
})(jQuery);



//全局ajax处理
$.ajaxSetup({
    //ie 都不缓存
    cache: !!UI.browser.ie,
    complete: function(jqXHR) {},
    data: {
        a: 12
    },
    error: function(jqXHR, textStatus, errorThrown) {

        //请求失败统一处理
    }
});
$(document).ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {
    //TODO 过滤错误码
    if (XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.errorCode == 10000001) {
        //没有登录 跳转到登录页面
    }
});
//让IE6-8认识HTML5标签
if (UI.browser.ie < 9) _.each("abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output picture progress section summary template time video".split(' '), function(o) {
    document.createElement(o);
});
//更新cable2 增加col类配置render
//金额计算
//position
//removeable
//dragable
//resizeable
//selectable
//sortable
