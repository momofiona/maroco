define(function(require, exports, module) {
    require('mousewheel');

    function RollBar(outContainer, setting) {
        if ($(outContainer).find('>.rollbar-content').length) return;
        var _rollbar = this,
            contentId = _.uniqueId('rollbar');
        this.namespace = '.' + contentId;
        this.container = $(outContainer);
        this.settings = setting;
        this.timer = 0;
        this.top = 0;
        this.left = 0;
        this.before = {
            'v': 0,
            'h': 0
        };
        this.touch = {};
        this.pressed = 0;
        this.vslider = $('<div/>', {
            'class': 'rollbar-handle',
            style: 'top:' + setting.pathPadding + 'px'
        });
        this.vpath = $('<div/>', {
            'class': 'rollbar-path-vertical'
        });
        this.hslider = $('<div/>', {
            'class': 'rollbar-handle',
            style: 'left:' + setting.pathPadding + 'px'
        });
        this.hpath = $('<div/>', {
            'class': 'rollbar-path-horizontal'
        });
        this.sliders = this.vslider.add(this.hslider);
        if (this.container.css('position') !== 'absolute') {
            this.container.css('position', 'relative');
        }
        this.container.css({
            'overflow': 'hidden'
        }).wrapInner('<div class="rollbar-content" id="' + contentId + '"></div>');
        this.content = this.container.children('.rollbar-content').css({
            'position': 'relative',
            'top': 0,
            'left': 0
        });
        //插入滚动条
        if (setting.scroll == 'horizontal') {
            this.container.prepend(this.hpath.append(this.hslider))
        } else if (setting.scroll == 'vertical') {
            this.container.prepend(this.vpath.append(this.vslider))
        } else {
            this.container.prepend(this.vpath.append(this.vslider), this.hpath.append(this.hslider))
        }
        this.vpath.add(this.hpath).css({
            'z-index': setting.zIndex,
            'display': 'none'
        });
        this.vslider.css({
            'height': setting.sliderSize,
            'opacity': setting.sliderOpacity
        });
        this.hslider.css({
            'width': setting.sliderSize,
            'opacity': setting.sliderOpacity
        });
        //插入顶部阴影
        if (setting.shadow) {
            this.shadow = $('<div class="rollbar-shadow">').hide().appendTo(this.container);
        }
        this.init();
        this.checkScroll();
        //ie6-9 onpropertychange
        //IE10 突变时间
        //IE11 突变观察者 var mutationObserver = new MutationObserver(callback);
        //anyway 还是定时器最好
        var lazytimer, _resize = function() {
            //当判断content不在dom上的时候移除定时器
            if (!document.getElementById(contentId)) {
                //去掉定时器
                clearInterval(lazytimer);
                $(document).off(_rollbar.namespace);
                $(window).off('resize', _resize);
                _rollbar.container.off(_rollbar.namespace);
                _rollbar.container = null;
                //避免意外情况下让界面不可选择
                $('body').removeClass('rollbar-noselect');
                return;
            }
            _rollbar.checkScroll();
        };
        if (setting.checkTimer) {
            lazytimer = setInterval(_resize, setting.checkTimer)
        } else {
            $(window).on('resize', _resize = _.throttle(_resize, 100, {
                leading: false
            }));
        }
    };
    //检查卷入高度变化
    RollBar.prototype.checkScroll = function() {
        var h = this.content.height(),
            ch = this.container.height(),
            w = this.content[0].scrollWidth,
            cw = this.container.width(),
            vdiff = h - ch,
            hdiff = w - cw,
            a = this.settings.pathPadding;
        if (vdiff < 0) vdiff = 0;
        if (hdiff < 0) hdiff = 0;
        /*        if (this.ch !== ch) {
                    this.ch = ch;
                    this.vpath.css({
                        'top': 0 + 'px',
                        'height': ch
                    });
                }
                if (this.cw !== cw) {
                    this.cw = cw;
                    this.hpath.css({
                        'top': 0 + 'px',
                        'height': cw 
                    });
                }*/
        if (vdiff != this.vdiff) {
            this.vpath.toggle(vdiff > 0);
            if (vdiff <= 0) {
                this.top = 0;
                this.content.css('top', this.top = 0);
            } else if (-this.top > vdiff) {
                //超载
                this.content.css('top', this.top = -vdiff);
            }
            this.vdiff = vdiff;
            this.vslider.height(100 * ch / h + '%');
        }
        if (vdiff > 0) this.vtrack = ch - 2 * a - this.vslider.height();
        //hdiff
        if (hdiff != this.hdiff) {
            this.hpath.toggle(hdiff > 0);
            if (hdiff <= 0) {
                // hdiff = 0;
                this.left = 0;
                this.content.css('left', this.left = 0);
            } else if (-this.left > hdiff) {
                //超载
                this.content.css('left', this.left = -hdiff);
            }
            this.hdiff = hdiff;
            this.hslider.width(100 * cw / w + '%');
        }
        if (hdiff > 0) this.htrack = cw - 2 * a - this.hslider.width();
    };

    RollBar.prototype.scroll = function(v, h, silent, e) {
        var a = this.settings.pathPadding;
        if (v < 0) {
            v = 0
        }
        if (v > this.vdiff) {
            v = this.vdiff
        }
        if (this.top !== -v) {
            this.content.css('top', this.top = -v);
            if (this.vdiff > 0) {
                this.vslider.css('top', Math.round(v / this.vdiff * this.vtrack) + a);
                if (e && (v && v != this.vdiff)) {
                    e.stopPropagation();
                    e.preventDefault()
                }
                if (this.shadow) {
                    this.shadow.toggle(v > 0);
                }
            }
        }

        if (h < 0) {
            h = 0
        }
        if (h > this.hdiff) {
            h = this.hdiff
        }
        //先判断
        if (this.left !== -h) {
            this.content.css('left', this.left = -h);
            if (this.hdiff > 0) {
                this.hslider.css('left', Math.round(h / this.hdiff * this.htrack) + a);
                if (e && (h && h != this.hdiff)) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }
        if (this.before.v != v || this.before.h != h) {
            if (!silent) this.settings.onscroll.call(this.container, v, h);
            this.before.v = v;
            this.before.h = h
        }
    };

    RollBar.prototype.init = function() {
        var f = $(document),
            _rollbar = this,
            body = $('body');
        this.sliders.on('mousedown' + this.namespace, function(e) {
            _rollbar.pressed = (e.target === _rollbar.vslider.get(0)) ? 1 : 2;
            var a = e.pageX;
            var b = e.pageY;
            var c = -_rollbar.top;
            var d = -_rollbar.left;
            var vrate = _rollbar.vdiff / _rollbar.vtrack;
            var hrate = _rollbar.hdiff / _rollbar.htrack;
            body.addClass('rollbar-noselect');
            f.on('mousemove' + _rollbar.namespace, function(e) {
                    if (_rollbar.pressed == 1) {
                        _rollbar.scroll(c + (e.pageY - b) * vrate, d)
                    } else {
                        _rollbar.scroll(c, d + (e.pageX - a) * hrate)
                    }
                })
                .on('selectstart' + this.namespace, function(e) {
                    e.preventDefault();
                });
        });
        f.on('mouseup' + this.namespace, function(e) {
            _rollbar.pressed = 0;
            f.off('mousemove' + _rollbar.namespace);
            f.off('selectstart' + _rollbar.namespace);
            body.removeClass('rollbar-noselect');
        });
        this.container.on('keydown' + this.namespace, function(e) {
                var keycode = e.keyCode;
                if (keycode == 9) {
                    //防止tab键引起的scroll卷入
                    setTimeout(function() {
                        _rollbar.container.scrollTop(0).scrollLeft(0);
                    });
                }
                var a = 0,
                    vkey = 0,
                    scrollamount = _rollbar.settings.scrollamount;
                vkey = (keycode == 38) ? -scrollamount : vkey;
                vkey = (keycode == 40) ? scrollamount : vkey;
                a = (keycode == 37) ? -scrollamount : a;
                a = (keycode == 39) ? scrollamount : a;
                if (vkey || a) {
                    _rollbar.scroll(-_rollbar.top + vkey, -_rollbar.left + a);
                }
            })
            .on('touchstart' + this.namespace, function(e) {
                var a = e.originalEvent;
                var b = a.changedTouches[0];
                _rollbar.touch.sx = b.pageX;
                _rollbar.touch.sy = b.pageY;
                _rollbar.touch.sv = _rollbar.vslider.position().top;
                _rollbar.touch.sh = _rollbar.hslider.position().left;
                // _rollbar.sliders.stop().fadeTo(_rollbar.settings.sliderOpacityTime, _rollbar.settings.sliderActiveOpacity);
                if (_rollbar.settings.blockGlobalScroll && (_rollbar.vdiff || _rollbar.hdiff)) {
                    a.stopPropagation()
                }
            })
            .on('touchmove' + this.namespace, function(e) {
                var a = e.originalEvent;
                var b = a.targetTouches[0];
                _rollbar.scroll(_rollbar.touch.sv + (_rollbar.touch.sy - b.pageY) * _rollbar.settings.touchSpeed, _rollbar.touch.sh + (_rollbar.touch.sx - b.pageX) * _rollbar.settings.touchSpeed, e);
                if (_rollbar.settings.blockGlobalScroll && (_rollbar.vdiff || _rollbar.hdiff)) {
                    a.preventDefault();
                    a.stopPropagation()
                }
            })
            .on('touchend' + this.namespace + ' touchcancel' + this.namespace, function(e) {
                var a = e.originalEvent;
                var b = a.changedTouches[0];
                // _rollbar.sliders.stop().fadeTo(_rollbar.settings.sliderOpacityTime, _rollbar.settings.sliderOpacity);
                if (_rollbar.settings.blockGlobalScroll && (_rollbar.vdiff || _rollbar.hdiff)) {
                    a.stopPropagation()
                }
            })
            .on('mousewheel' + this.namespace, function(e, a, b, c) {
                //event, delta, deltaX, deltaY
                var d = e.target.nodeName;
                if (d == 'TEXTAREA' || (d == 'SELECT' || d == 'OPTION')) {
                    e.stopPropagation();
                    return
                }
                if (_rollbar.vdiff > 0 || _rollbar.hdiff > 0) {
                    _rollbar.scroll(-_rollbar.top - c * _rollbar.settings.scrollamount, -_rollbar.left - b * _rollbar.settings.scrollamount, 0, e);
                }

                if (_rollbar.settings.blockGlobalScroll && (_rollbar.vdiff || _rollbar.hdiff)) {
                    e.preventDefault();
                    e.stopPropagation()
                }
            })
            .on("dragstart" + this.namespace, function(e) {
                e.preventDefault()
            })
            .on('rollbar' + this.namespace, function(e, v, h, silent) {
                e.stopPropagation();
                if (v === undefined) {
                    //手动触发
                    _rollbar.checkScroll();
                } else {
                    v = $.isNumeric(v) ? v : -this.top;
                    h = $.isNumeric(h) ? h : -this.left;
                    _rollbar.scroll(v, h, silent)
                }
            })
            .on('mouseenter' + this.namespace, function() {
                _rollbar.sliders.css('opacity', _rollbar.settings.sliderOpacity);
            }).on('mouseleave' + this.namespace, function() {
                _rollbar.sliders.css('opacity', .05);
            });
    };

    var defaults = {
        scroll: 'both',
        checkTimer: 500, //检查频率
        blockGlobalScroll: false, //阻止mousewheel向上冒泡
        sliderSize: '30%',
        sliderOpacity: 0.3,
        scrollamount: 100, //每次滚动的高度/宽度
        touchSpeed: 0.3,
        pathPadding: 3, //滚动条边界距离两头的距离
        zIndex: 100,
        onscroll: $.noop
    };
    $.fn.rollbar = function(options) {
        options = _.create(defaults, options);
        return this.each(function() {
            new RollBar(this, options);
        });
    }
});
