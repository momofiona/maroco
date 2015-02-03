//seajs config2
seajs.config({
    alias: {
        dot: 'js/vendor/doT.min',
        ztree: 'js/vendor/zTree/jquery.ztree.all-3.5.min.js'
    },
    paths: {
        'ui': 'js/ui'
    },
    base: seajs.resolve('/'),
    vars: {
        'locale': 'cn'
    },
    map: [
        [/^(.*\.(?:css|js))(.*)$/i, '$1?20150101']
    ]
});

/**
 * UI base
 * 数据类的放到_
 * UI类的放到UI下
 */
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
        //UI widget
        UI = function(config) {
            config.$ = function(arg) {
                return $(arg, this.el);
            };
            //el init
            config.el = $(config.el || '<div/>');
            if (config.init) {
                config.init.apply(config);
            }
            //绑定事件
            _.each(config.events, function(v, k) {
                var s = k.indexOf(' ');
                config.el.on(k.slice(0, s), $.trim(k.slice(s + 1)), function(event) {
                    var _fn = (_.isString(v) ? config[v] : v);
                    if (_fn) _fn.call(this, event, config);
                });
            });
            if (config.create) {
                config.create.apply(config);
            }
            return config;
        };
    //一些基本属性
    _.extend(UI, {
        //非法字符，依据windows文件夹命名规则
        illegalCharacter: /[^\\\/:\*\?\"<>\|]/,
        //分页每页数量
        itemsOnPage: 15
    });
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

    //underscore mixin
    _.mixin({
        /**
         * 全局唯一ID ，局部可用_.uniqueId(UI.guid)
         */
        guid: function(prefix) {
            var n = _.now().toString(32),
                i;
            for (i = 0; i < 5; i++) {
                n += Math.floor(Math.random() * 65535).toString(32);
            }
            n += _.uniqueId().toString(32);
            return prefix ? prefix + n : n;
        },
        //原型链
        proto: Object.create || function(proto) {
            function F() {};
            F.prototype = proto;
            return new F;
        },
        dot: doT.template,
        queryString: function(str, sep, eq) {
            var ret = {};
            if (typeof str !== 'string' || $.trim(str).length === 0) {
                return ret;
            }
            str = $.trim(str).replace(/^\?+/, '');
            var pairs = str.split(sep || '&'),
                re = /^(\w+)\[\]$/,
                pair, key, val, m;
            eq = eq || '=';
            for (var i = 0; i < pairs.length; i++) {
                pair = pairs[i].split(eq);
                key = decodeURIComponent($.trim(pair[0]));
                val = decodeURIComponent($.trim(pair.slice(1).join(eq)));
                m = key.match(re);
                if (m && m[1]) {
                    key = m[1];
                }
                if (ret.hasOwnProperty(key)) {
                    if (!_.isArray(ret[key])) {
                        ret[key] = [ret[key]];
                    }
                    ret[key].push(val);
                } else {
                    ret[key] = m ? [val] : val;
                }
            }
            return ret;
        }
    });

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

    /**
     * button 给页面上所有btn绑定事件
     * @type {Array}
     */
    var btnClassNames = ['log', 'silver', 'note', 'info', 'warn', 'error', 'link'];
    var button = UI.button = function(dom, cName) {
        //主动触发
        var _t = $(dom);
        if (_t.data('btype') === undefined) {
            cName = cName || _.find(btnClassNames, function(name) {
                return _t.hasClass(name);
            });
            if (cName) {
                _t.addClass(cName + '-hover');
                _t.mouseenter(function() {
                    $(this).addClass(cName + '-hover');
                }).mouseleave(function() {
                    $(this).removeClass(cName + '-hover');
                }).mousedown(function(e) {
                    //解决鼠标拖动元素的时候
                    var _btn = $(this);
                    if (_btn.hasClass('active')) return;
                    e.preventDefault();
                    _btn.addClass(cName + '-active');
                    $(document).one('mouseup', function(e) {
                        _btn.removeClass(cName + '-active');
                    });
                });
            }
            _t.data('btype', cName);
        }
        return _t;
    };
    //被动触发
    $(document).on('mouseenter', '.b.' + btnClassNames.join(',.b.'), function() {
        button(this);
    }).on('click','a[href="#"]',function(){
        return false;
    });

    //设置seaID
    define('ui', function(require) {
        require('api'); //注掉此行来禁用假数据
        return UI;
    });
    //暴露全局调用
    window.UI = UI;
})(jQuery);



//全局ajax处理
$.ajaxSetup({
    //ie 都不缓存
    cache: !UI.browser.ie,
    complete: function(jqXHR) {},
    data: {},
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

//console fix，生产环境用uglify去掉console
(function() {
    if (window.console) return;
    var console = window.console = {};
    _.each('assert clear count debug dir dirxml error exception group groupCollapsed groupEnd info log markTimeline profile profileEnd table time timeEnd timeStamp trace warn'.split(' '), function(o) {
        console[o] = $.noop;
    });
})();
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
