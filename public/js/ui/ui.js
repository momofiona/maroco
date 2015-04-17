//seajs config2
seajs.config({
    alias: {
        ztree: 'js/vendor/zTree/jquery.ztree.all-3.5.min.js',
        my97: 'js/vendor/my97/WdatePicker.js'
    },
    paths: {
        'ui': 'js/ui'
    },
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
                config.init();
            }
            //绑定事件
            _.each(config.events, function(v, k) {
                var s = k.indexOf(' ');
                config.el.on(s == -1 ? k : k.slice(0, s), s == -1 ? '' : $.trim(k.slice(s + 1)), function(event) {
                    var _fn = (_.isString(v) ? config[v] : v);
                    if (_fn) return _fn.call(this, event, config);
                });
            });
            if (config.create) {
                config.create();
            }
            return config;
        };
    //一些基本属性
    _.extend(UI, {
        //非法字符，依据windows文件夹命名规则
        illegalCharacter: /[^\\\/:\*\?\"<>\|]/,
        //分页每页数量
        count: 15,
        server: seajs.data.base
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
            //下面这些尽量不要使用
            chrome: !!window.chrome && window.chrome.webstore,
            firefox: !!window.sidebar && !window.sidebar.nodeName, //这是不严谨的
            safari: /constructor/i.test(window.HTMLElement),
            opera: !!window.opera || /opera|opr/i.test(navigator.userAgent)
        };
    }
    UI.browser = browser;
    var proto = Object.create || function(proto) {
            function F() {};
            F.prototype = proto;
            return new F;
        }
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
        proto: function(prototype, object) {
            var ret = proto(prototype);
            return object ? _.extend(ret, object) : ret;
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
     * IE6\7\8不支持input，用'onpropertychange' in document
     * IE9比较鸡肋 无法监控backspace delete 和右键菜单的剪切 撤销 删除
     * 感谢 toFishes 提醒IE9可以用selectionchange监控解决问题
     * 剩余bug：当input只有一个字符的情况下，右键撤销不会触发selectionchange
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
                // oldValue = elem.value;
                if (browser.ie == 9) {
                    $(elem).on('focus._ie9inputFixed', function() {
                        document.addEventListener('selectionchange', setter, false);
                    }).on('blur._ie9inputFixed', function() {
                        document.removeEventListener('selectionchange', setter, false);
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
                if (browser.ie == 9) $.event.remove(this, "._ie9inputFixed");
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
     * 分页： page count total
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    var loader = function(config) {
        config = $.extend({
            baseparams: {},
            beforeLoad: $.noop,
            afterLoad: $.noop,
            load: function(_filter) {
                if (!this.url) return;
                if (this.xhr) this.xhr.abort();
                this.beforeLoad(_filter);
                //开启筛选
                if (_filter) {
                    this.filter = _filter;
                    this.page = _filter.page || 1;
                }
                this.xhr = $.ajax({
                    url: this.url,
                    data: $.extend({}, this.baseparams, {
                        page: this.page,
                        count: this.count
                    }, this.filter),
                    cache: this.cache,
                    dataType: 'JSON',
                    success: function(data) {
                        config.afterLoad(data);
                    }
                });
            }
        }, config);
        //分页
        if (config.count && !config.page) config.page = 1;
        return config
    }
    UI.loader = loader;

    /**
     * button 给页面上所有btn绑定事件
     * @type {Array}
     */
    var btnClassNames = ['log', 'silver', 'note', 'info', 'safe', 'warn', 'care', 'error', 'link', 'dark'];
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
                    if(e.which!==1) return;
                    //解决鼠标拖动元素的时候
                    var _btn = $(this);
                    if (_btn.hasClass('active')) return;
                    e.preventDefault();
                    _btn.addClass(cName + '-active');
                    $(document).one('mouseup', function(e) {
                        _btn.removeClass(cName + '-active');
                        //解决IE67 button 黑边
                        if (UI.browser.ie < 8) {
                            _btn[0].blur();
                        }
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
    }).on('click', 'a[href="#"]', function() {
        return false;
    });

    //tabs
    UI.tabs = function(conf) {
        return UI($.extend(true, {
            active: function(n) {
                this.tabs.find('a:eq(' + n + ')').trigger('click');
            },
            onActive: $.noop,
            cache: {},
            getPanel: function(o) {
                //IE67对于js插入的a标签，取.attr('href')会带上location.href
                //对于IE678，取 o.panel 会返回.attr('panel')
                //如果是#开头的，就全局找，否则在当前下找
                var id = o.getAttribute('panel'),
                    cache = this.cache,
                    ret;
                if (id) {
                    if (cache[id]) {
                        return cache[id]
                    } else if (id.indexOf('#') == 0) {
                        ret = $(id);
                    } else {
                        ret = this.$(id);
                    }
                    //如果存在则返回并缓存
                    if (ret.length) {
                        return cache[id] = ret;
                    }
                }
            },
            events: {
                'click >.tab a': function(e, conf) {
                    var t = this,
                        tab = $(t),
                        panel = tab.attr('panel');
                    if (this == conf.tab) return;
                    if (panel) {
                        //隐藏其他容器
                        conf.tabs.find('a').each(function(i, o) {
                            //hide other panels
                            if (o === t) return;
                            var box = conf.getPanel(o);
                            box && box.hide();
                        });
                        //show current panel
                        tab.parent().addClass('active').siblings().removeClass('active');
                        var panel = $(panel).show();
                        conf.onActive(t, panel);
                        conf.tab = t;
                        conf.panel = panel;
                        return false;
                    }
                }
            },
            init: function() {
                this.tabs = this.el.children('.tab');
            },
            create: function() {
                this.active(0);
            }
        }, conf));
    };
    //navs
    UI.navs = function(conf) {
        return UI($.extend(true,{
            events: {
                'click a': function(e, conf) {
                    var isCart = conf.isCart(e, this);
                    if (isCart) {
                        conf.toggle(this);
                        return false;
                    }
                    if (conf.onClick(this) === false) return false;
                },
                'dblclick a': function(e, conf) {
                    conf.isCart(e, this) || conf.toggle(this);
                    return false;
                }
            },
            //点击的是否是cart
            isCart: function(e, a) {
                var isCart = $(e.target).hasClass('nav-cart');
                if (!isCart) {
                    isCart = $(a).attr('href');
                    isCart = isCart === undefined || isCart === '' || isCart === '#';
                }
                return isCart;
            },
            //主动触发接口
            active: function(a) {
                if (!a.jquery) {
                    a = this.$(a);
                }
                this.$('a').removeClass('active');
                return a.addClass('active');
            },
            //open or close
            toggle: function(a, force, speed) {
                var t = $(a),
                    op = this.openCls,
                    speed = speed === undefined ? this.speed : speed,
                    isOpen = t.hasClass(op);
                //如果设置强制打开已经是打开状态
                if (t.length == 0 || force === true && isOpen || t.next().length == 0) return;
                if (isOpen || false == force) {
                    t.removeClass(op).next().slideUp(speed);
                    this.onCollapse(t);
                } else {
                    t.addClass(op).next().slideDown(speed);
                    if(this.accordion){
                        this.toggle(t.parent().siblings().find('>.'+this.openCls),false);
                    }
                    this.onExpand(t);
                }
            },
            speed: 'fast',
            //手风琴
            accordion:false,
            //链接打开时的class
            openCls: 'nav-open',
            cartCls: 'f f-down',
            //展开时回调
            onExpand: $.noop,
            //收缩时回调
            onCollapse: $.noop,
            //点击时触发
            onClick: $.noop,
            create: function() {
                //添加toggle按钮
                this.el.addClass(this.cls).find('a+ul').prev().prepend('<b class="nav-cart ' + this.cartCls + '"></b>');
            }
        }, conf));
    };
    //暴露全局调用
    window.UI = UI;
})(jQuery);



//全局ajax处理
$.ajaxSetup({
    //ie 都不缓存
    cache: !UI.browser.ie,
    complete: function(jqXHR, b, c) {},
    data: {},
    error: function(jqXHR, textStatus, errorThrown) {
        //请求失败统一处理
    }
});
$(document).ajaxSend(function(event, XMLHttpRequest, ajaxOptions) {
    //多次点击只发送一次ajax请求
    var t = ajaxOptions.target;
    if (t) {
        if (t.data('_waiting_')) {
            XMLHttpRequest.abort();
            t.trigger('waiting', [null]);
        } else {
            t.data('_waiting_', 1).trigger('waiting', ajaxOptions);
        }
    }
}).ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {
    //TODO 过滤错误码
    if (XMLHttpRequest.responseJSON && XMLHttpRequest.responseJSON.errorCode == 999) {
        //没有登录 跳转到登录页面
        return;
    }
}).ajaxComplete(function(event, XMLHttpRequest, ajaxOptions) {
    var t = ajaxOptions.target;
    if (t) {
        t.removeData('_waiting_').trigger('waiting');
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
//金额计算
//position
//removeable
//dragable
//resizeable
//selectable
//sortable