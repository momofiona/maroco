/**
 * UI base
 */
(function($) {
    'use strict';
    if(window.UI) return;
    //UI widget $.ui.keyCode
    var UI = function(config) {
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

    /**
     * 浏览器判断 主要判断IE6-10
     */
    var browser = {
        webkit: 'webkitHidden' in document,
        ms: 'msHidden' in document, //IE10+
        moz: 'mozHidden' in document,
        //IE6-10
        ie: window.ActiveXObject ? window.atob ? 10 : document.addEventListener ? 9 : document.querySelector ? 8 : window.XMLHttpRequest ? 7 : 6 : undefined,
        // ie11: '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style,
        chrome: !!window.chrome && window.chrome.webstore,
        firefox: !!window.sidebar && !!window.sidebar.addSearchEngine,
        safari: /constructor/i.test(window.HTMLElement)
    };
    //一些公用属性
    _.extend(UI, {
        //非法字符，依据windows文件夹命名规则
        illegalCharacter: /[^\\\/:\*\?\"<>\|]/,
        //分页每页数量
        count: 15,
        server: seajs.data.base,
        browser: browser
    });
    //underscore mixin
    _.mixin({
        /**
         * 全局唯一ID ，局部可用_.uniqueId
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
     * IE8中如果监控和赋值同时绑定，那么第一次输入不会触发 onpropertychange
     * IE9比较鸡肋 无法监控backspace delete 和右键菜单的剪切 撤销 删除
     * 感谢 toFishes 提醒IE9可以用selectionchange监控解决问题
     * 剩余bug：当input只有一个字符的情况下，右键撤销不会触发selectionchange
     */
    if (browser.ie < 10) {
        // 检查是否为可输入元素
        var isInput = function(elem) {
                return elem.nodeName == 'INPUT' || elem.nodeName == 'TEXTAREA';
            },
            iefx = _.uniqueId('.ieinputFixed');
        $.event.special.input = {
            setup: function() {
                if (!isInput(this)) return false;
                var elem = this,
                    oldValue = this.value,
                    setter = function() {
                        if (oldValue !== elem.value) {
                            oldValue = elem.value;
                            $.event.trigger('input', null, elem);
                        }
                    },
                    doc = $(document);
                // oldValue = elem.value;
                if (browser.ie == 9 || browser.ie == 8) {
                    $(elem).on('focus' + iefx, function() {
                        doc.on('selectionchange' + iefx, setter);
                    }).on('blur' + iefx, function() {
                        doc.off('selectionchange' + iefx, setter);
                    });
                }
                // IE8
                if (browser.ie == 8) {
                    $(elem).on('keyup' + iefx, setter);
                }
                //ie6-9
                elem.attachEvent('onpropertychange', $.data(elem, iefx, function(event) {
                    if (event.propertyName.toLowerCase() == "value") {
                        setter();
                    }
                }));
            },
            teardown: function() {
                if (!isInput(this)) return false;
                if (browser.ie == 9 || browser.ie == 8) $.event.remove(this, iefx);
                this.detachEvent('onpropertychange', $.data(this, iefx));
                $.removeData(this, iefx);
            }
        };
    }
    $.fn.input = function(handler) {
        return this.on('input', handler);
    };
    //扩展serializeObject
    $.fn.serializeObject = function(trim) {
        var params = this.serializeArray(),
            res = {},
            tmp, v, un;
        _.each(params, function(o) {
            tmp = res[o.name];
            v = trim ? $.trim(o.value) : o.value;
            if (tmp !== un) {
                if (_.isArray(tmp)) {
                    tmp.push(v);
                } else {
                    res[o.name] = [tmp, v];
                }
            } else {
                res[o.name] = v;
            }
        });
        return res;
    };
    /**
     * 基础加载器
     * 分页： page count total
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    UI.loader = function(config) {
        config = $.extend({
            baseparams: {},
            beforeLoad: $.noop,
            afterLoad: $.noop,
            load: function(_filter) {
                if (!this.url) return;
                if (this.xhr) this.xhr.abort();
                //开启筛选
                if (_filter) {
                    this.filter = _filter;
                    //如果开启了分页
                    if (this.count) this.page = _filter.page || 1;
                }
                this.beforeLoad(_filter);
                this.xhr = $.ajax({
                    url: this.url,
                    type: this.loadtype,
                    loadtip: this.loadtip,
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
        return config;
    };

    /**
     * button 给页面上所有btn绑定事件
     * @type {Array}
     */
    var btnClassNames = ['log', 'silver', 'note', 'info', 'safe', 'warn', 'care', 'error', 'link', 'dark'];
    var button = function(dom, cName) {
        //主动触发
        var _t = $(dom);
        if (_t.data('btype') === undefined) {
            cName = cName || _.find(btnClassNames, function(name) {
                return _t.hasClass(name);
            });
            if (cName) {
                _t.addClass(cName + '-hover');
                _t.mouseenter(function() {
                    _t.addClass(cName + '-hover');
                }).mouseleave(function() {
                    _t.removeClass(cName + '-hover');
                }).mousedown(function(e) {
                    if (e.which !== 1) return;
                    //解决鼠标拖动元素的时候
                    if (_t.hasClass('active')) return;
                    e.preventDefault();
                    _t.addClass(cName + '-active');
                    $(document).one('mouseup', function() {
                        _t.removeClass(cName + '-active');
                        //解决IE67 button 黑边
                        if (UI.browser.ie < 8) {
                            dom.blur();
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
    }).on('click', 'a[href="#"]', function(e) {
        e.preventDefault();
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
                        return cache[id];
                    } else if (id.indexOf('#') === 0) {
                        ret = $(id);
                    } else {
                        ret = this.el.children(id);
                    }
                    //如果存在则返回并缓存
                    if (ret.length) {
                        return cache[id] = ret;
                    }
                }
            },
            events: {
                'click >.tab a': function(e, conf) {
                    if (this == conf.tab) return;
                    var t = this,
                        tab = $(t),
                        panel = conf.getPanel(this);
                    if (panel) {
                        //隐藏其他容器
                        conf.tabs.find('a').each(function(i, o) {
                            //hide other panels
                            if (o === t) return;
                            var box = conf.getPanel(o);
                            if (box) box.hide();
                        });
                        //show current panel
                        panel.show();
                        tab.parent().addClass('active').siblings().removeClass('active');

                        conf.tab = t;
                        conf.panel = panel;
                        conf.onActive(t, panel);
                        e.preventDefault();
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
        return UI($.extend(true, {
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
                    isOpen = t.hasClass(op);
                speed = speed === undefined ? this.speed : speed;
                //如果设置强制打开已经是打开状态
                if (t.length === 0 || force === true && isOpen || t.next().length == 0) return;
                if (isOpen || false == force) {
                    t.removeClass(op).next().slideUp(speed);
                    this.onCollapse(t);
                } else {
                    t.addClass(op).next().slideDown(speed);
                    if (this.accordion) {
                        this.toggle(t.parent().siblings().find('>.' + this.openCls), false);
                    }
                    this.onExpand(t);
                }
            },
            speed: 'fast',
            //手风琴
            accordion: false,
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
    //IE中插入flash的时候title自动变化修复 
    //http://stackoverflow.com/questions/4562423/ie-title-changes-to-afterhash-if-the-page-has-a-url-with-and-has-flash-s
    if (browser.ie < 10) {
        document.attachEvent('onpropertychange', function(evt) {
            if (evt.propertyName === 'title' && document.title) {
                setTimeout(function() {
                    var b = document.title.indexOf('#');
                    if (b !== -1) {
                        document.title = document.title.slice(0, b);
                    }

                }, 1);
            }
        });
    }

    //全局ajax处理
    $.ajaxSetup({
        cache: false
    });
    $(document).ajaxSend(function(event, XMLHttpRequest, ajaxOptions) {
        //多次点击只发送一次ajax请求
        var t = ajaxOptions.target;
        if (t) {
            var xhr = $(t).data('_xhr_');
            if (xhr) {
                xhr.abort();
            }
            $(t).data('_xhr_', XMLHttpRequest);
            if (t.tagName == 'BUTTON') {
                t.disabled = true;
            }
        }
        //loading
        var tip = ajaxOptions.loadtip;
        if (tip) {
            seajs.use('ui/notify', function(notify) {
                if (!ajaxOptions.loadtip) return; //已经完成无需弹出
                ajaxOptions.loadtip = notify.loading(typeof tip == 'string' ? {
                    msg: tip
                } : tip);
            });
        }
    }).ajaxSuccess(function(event, XMLHttpRequest, ajaxOptions) {
        //TODO 过滤错误码
        var v = XMLHttpRequest.responseJSON;
        if (v && !v.success && v.data == 20000006) {
            seajs.use('ui/notify', function(notify) {
                notify.error('您还没有登录');
                //清空user
                $.removeCookie('user', {
                    path: '/'
                });
                _.delay(function() {
                    location = UI.server + 'login.html';
                }, 3000);
            });
        }
    }).ajaxComplete(function(event, XMLHttpRequest, ajaxOptions) {
        var t = ajaxOptions.target;
        if (t && t.tagName == 'BUTTON') {
            t.disabled = false;
            $(t).removeData('_xhr_');
        }
        //loading,如果tip不是notify对象
        var tip = ajaxOptions.loadtip;
        if (tip) {
            ajaxOptions.loadtip = 0;
            tip.close && tip.close();
        }
    });

    //console fix
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

})(jQuery);
