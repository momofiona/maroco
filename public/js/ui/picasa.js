/**
 * Picasa - 多媒体查看 
 * 
 * 如果是图片：支持缩放,
 * 进度条
 * 如果带thumb参数，显示缩略图
 * 如果是html：最大尺寸，锁定缩放
 * 支持右侧固定分栏
 * 锁定比例 1-10000
 * item:{
 *     src:'xxxx.jpg'//图片路径,有此参数表示图片模式
 *     html:'string',//有此参数表示html模式
 *     iframe:'iframe src',//有此参数表示iframe模式
 * }
 */
define(function(require, exports, module) {
    require('css/picasa.css');
    require('draggable');
    require('js/vendor/jquery.mousewheel');
    var isIE6 = UI.browser.ie === 6,
        timmer, sTimmer,
        defaults = {
            sideWidth: 0, //右侧栏位宽度
            mask: true, //背景遮罩
            margin: [0, 0, 0, 0], //边距
            padding: [10, 50, 80, 50], //边距
            skin: '', //皮肤
            thumb: true, //默认开启缩略图模式
            //关闭事件
            close: function(e, conf) {
                conf = conf || this;
                conf.el.remove();
                $(window).off('resize.picasa');
                $('body').removeClass('pica-body');
            },
            escExit: true,
            //调整位置
            layout: function() {
                var _t = this,
                    win = $(window),
                    pd = _t.padding,
                    _w = win.width() - _t.margin[3] - _t.margin[1] - _t.sideWidth - pd[1] - pd[3],
                    _h = win.height() - _t.margin[0] - _t.margin[2] - pd[0] - pd[2];
                _t.sceneMax = {
                    width: _w,
                    height: _h,
                    rate: _w / _h,
                    x: _w / 2 + pd[3],
                    y: _h / 2 + pd[0]
                };
                this.stage.css({
                    top: _t.margin[0],
                    left: _t.margin[3],
                    right: _t.margin[1] + _t.sideWidth,
                    bottom: _t.margin[2]
                });
                if (_t.sideWidth) {
                    this.sidebar.css({
                        width: _t.sideWidth,
                        top: _t.margin[0],
                        right: _t.margin[1],
                        bottom: _t.margin[2]
                    });
                }
                if (isIE6) {
                    this.stage.width(win.width() - _t.margin[1] - _t.margin[3] - _t.sideWidth).height(win.height() - _t.margin[0] - _t.margin[2]);
                    this.sidebar.height(win.height() - _t.margin[0] - _t.margin[2]);
                }
                //判断当前是否是html或者iframe模式，需要重新校准窗口大小
                var itm = _t.data[_t.active];
                if (!itm.src) {
                    _t.scene.height(itm.height = _h).width(itm.width = _w);
                }
            },
            //图片需要先loading后在插入
            load: function(itm, fn) {
                if (itm.readyState == 2) fn();
                var img = new Image(),
                    _t = this;
                if (itm.readyState > 0) return; //1 加载中 2加载完成 -1加载失败
                itm.readyState = 1;
                _t.scene.empty().addClass('pica-loading');
                img.onload = function() {
                    itm.readyState = 2;
                    itm._width = this.width;
                    itm._height = this.height;
                    itm.rate = this.width / this.height;
                    var _w, _h, max = _t.sceneMax;
                    //如果场景比较宽
                    if (max.rate > itm.rate) {
                        _h = Math.min(itm._height, max.height);
                        _w = _h * itm.rate;
                    } else {
                        _w = Math.min(itm._width, max.width);
                        _h = _w / itm.rate;
                    }
                    _.extend(itm, {
                        width: _w,
                        height: _h,
                        scale: _w / itm._width,
                        left: max.x - _w / 2,
                        top: max.y - _h / 2
                    });
                    _t.scene.removeClass('pica-loading');
                    fn();
                }
                img.onerror = function() {
                    itm.readyState = -1;
                    _t.scene.removeClass('pica-loading');
                    fn();
                }
                img.src = itm.src;
            },
            position: function() {
                var itm = this.data[this.active];
                this.scene.css({
                    width: itm.width,
                    height: itm.height,
                    left: itm.left,
                    top: itm.top
                });
            },
            //当前显示第几个
            active: 0,
            //切换回调
            onchange: $.noop,
            //页码回调
            setTitle: function(n, itm) {
                return '<span class="pica-page">' + n + '/' + this.data.length + '</span>' + (itm.title || '');
            },
            prev: function(e, conf) {
                conf = conf || this;
                conf.play(conf.active - 1);
            },
            next: function(e, conf) {
                conf = conf || this;
                conf.play(conf.active + 1);
            },
            play: function(n) {
                var _t = this,
                    len = this.data.length - 1;
                if (n < 0 || n > len) return;
                var itm = this.data[n];
                this.prevBtn.toggle(n !== 0);
                this.nextBtn.toggle(n !== len);
                this.rotater.toggle(!!itm.src);
                this.active = n;
                this.thumbUl.css('marginLeft', -15 - n * 32);
                this.title.html(_t.setTitle(n + 1, itm) || '');
                this.insert(n, itm);
                //change 回调
                this.onchange(itm);
            },
            //右旋90度,接受整型数字
            rotate: function(e, conf) {
                //当点击触发时 conf，当主动调用时this
                conf = conf || this;
                var itm = conf.data[conf.active];
                //只有图片带旋转
                if (itm.src) {
                    itm.rotate = (itm.rotate || 0) + 1;
                    conf.scene.children().get(0).style.cssText = conf.rotateStyle(itm);
                }
            },
            //IE678使用滤镜，IE9+使用transform
            rotateStyle: function(itm, isInsert) {
                if (isInsert && !itm.rotate) return '';
                return this.cssPrefix != undefined ? this.cssPrefix + 'transform:rotate(' + (90 * itm.rotate) + 'deg)' : 'filter:progid:DXImageTransform.Microsoft.BasicImage(rotation=' + (itm.rotate + 4) % 4 + ')';
            },
            //插入场景
            insert: function(active, itm) {
                var _t = this,
                    max = _t.sceneMax;
                if (itm.src) {
                    //图片
                    _t.scene.draggable("enable");
                    _t.load(itm, function() {
                        if (active == _t.active) {
                            if (itm.readyState == 2) {
                                //在支持css动画的浏览器上，在切换的时候去掉width和height的动画，使立即变更大小防止眼晕
                                if (_t.cssPrefix && timmer) {
                                    clearTimeout(timmer);
                                    _t.scene.addClass('pica-tranfix');
                                }
                                //如果加载成功了就调整大小
                                _t.position();
                                if (_t.cssPrefix) timmer = setTimeout(function() {
                                    _t.scene.removeClass('pica-tranfix');
                                }, 300);
                            }
                            var rs = _t.rotateStyle(itm, 1);
                            _t.scene.html('<img src="' + itm.src + '"' + (rs ? ' style="' + rs + '"' : '') + ' class="pica-player pica-img">');
                        }
                    });
                } else {
                    _t.scene.draggable("disable");
                    _.extend(itm, {
                        width: max.width,
                        height: max.height,
                        left: _t.padding[3],
                        top: _t.padding[0]
                    });
                    if (itm.iframe) {
                        //如果是iframe模式，全屏
                        _t.scene.html('<iframe class="pica-player pica-frame scroll" src="' + itm.iframe + '"></iframe>');
                    } else {
                        //其他模式就插入html，如果没有html属性，可在onchange里面搞
                        _t.scene.html('<div class="pica-player pica-html scroll">' + (itm.html || '') + '</div>');
                    }
                    _t.position();
                }
            },
            events: {
                'click .ac-pica-close': 'close',
                'click .ac-pica-prev': 'prev',
                'click .ac-pica-next': 'next',
                'click .pica-rotate': 'rotate'
            },
            //比例提示
            showTip: function(scale) {
                var _t = this;
                if (sTimmer) {
                    clearTimeout(sTimmer);
                } else {
                    _t.stip.stop().show().fadeIn();
                }
                sTimmer = setTimeout(function() {
                    _t.stip.fadeOut();
                    sTimmer = 0;
                }, 800);
                this.stip.html(scale);
            },
            init: function() {
                var _t = this;
                _t.el.addClass('mask glass pica-body ' + _t.skin).html('<div class="pica-sidebar scroll am-fadeup"></div>\
                <div class="pica-stage  user-select am-fadeup">\
                    <div class="pica-scene"></div>\
                    <div class="pica-thumb"><ul></ul></div>\
                    <div class="pica-title"></div>\
                    <div class="pica-tool"><b class="f f-turnr f-2x pica-rotate"></b></div>\
                    <div class="pica-prev ac-pica-prev">&lt;</div>\
                    <div class="pica-next ac-pica-next">&gt;</div>\
                    <span class="pica-stip"></span>\
                </div>\
                <div class="pica-close ac-pica-close"></div>').appendTo($('body').addClass('pica-body'));

                if (_t.escExit) {
                    _t.el.attr('tabIndex', 1).keydown(function(e) {
                        if (e.keyCode == 27) {
                            _t.close();
                        }
                    }).focus();
                }
                //css3前缀
                var _els = _t.el[0].style;
                _t.cssPrefix = _.find(['-webkit-', '-moz-', '-ms-', ''], function(o) {
                    return o + 'transform' in _els;
                });
                _t.stip = _t.$('.pica-stip');
                //绘制主框架
                // _t.mask = _t.$('.pica-mask');
                //按钮
                _t.closeBtn = _t.$('.pica-close');
                _t.prevBtn = _t.$('.pica-prev');
                _t.nextBtn = _t.$('.pica-next');
                //tools
                _t.rotater = _t.$('.pica-rotate');
                //中心舞台
                _t.stage = _t.$('.pica-stage').on('mousewheel', function(e, delta, deltaX, deltaY) {
                    var itm = _t.data[_t.active];
                    //只对图片有效
                    if (itm.src && 'scale' in itm) {
                        e.preventDefault();
                        e.stopPropagation();
                        var _dt = delta > 0 ? 1.15 : 0.85,
                            _scale = parseInt(itm.scale * _dt * 100),
                            sceneMax = _t.sceneMax;
                        if (_scale < 1 || _scale > 10000) return;
                        //如果鼠标没有在图片上，并且中心点在图片上，就当鼠标在stage中心点上
                        if (!$(e.target).hasClass('pica-player')) {
                            //如果stage中心点在图片上,以stage中心点为准，否则以图片中心点为准
                            if (sceneMax.x < itm.left || sceneMax.y < itm.top || sceneMax.x > itm.left + itm.width || sceneMax.y > itm.top + itm.height) {
                                e = {
                                    offsetX: itm.left + itm.width / 2,
                                    offsetY: itm.top + itm.height / 2
                                }
                            } else {
                                e = {
                                    offsetX: sceneMax.x,
                                    offsetY: sceneMax.y
                                }
                            }
                        }
                        itm.scale *= _dt;
                        itm.width = itm._width * itm.scale;
                        itm.height = itm._height * itm.scale;
                        itm.left = e.offsetX - (e.offsetX - itm.left) * _dt;
                        itm.top = e.offsetY - (e.offsetY - itm.top) * _dt;
                        _t.showTip(_scale + '%');
                        _t.position();
                    }
                });
                _t.scene = _t.$('.pica-scene').draggable({
                    drag: function(e, ui) {
                        var itm = _t.data[_t.active];
                        itm.left = ui.position.left;
                        itm.top = ui.position.top;
                    }
                });
                var thumb = _t.thumb;
                _t.thumb = _t.$('.pica-thumb');
                _t.thumbUl = _t.thumb.find('ul');
                if (thumb) {
                    //缩略图模式
                    _t.thumb.on('mousewheel', function(e, delta, deltaX, deltaY) {
                        e.preventDefault();
                        e.stopPropagation();
                        if (delta < 0) {
                            _t.next();
                        } else {
                            _t.prev();
                        }
                    });
                    _t.thumbUl.html(_.reduce(_t.data, function(memo, v, i) {
                        return memo + '<li><img index="' + i + '" title="' + (v.title || "") + '" class="am-fadeup" src="' + v.thumb + '"></li>'
                    }, '')).on('click', 'img', function() {
                        _t.play(+this.getAttribute('index'));
                    });
                } else {
                    _t.thumb.hide();
                }
                _t.title = _t.$('.pica-title');
                _t.tool = _t.$('.pica-tool');
                _t.sidebar = _t.$('.pica-sidebar');
                if (_t.sideWidth) {
                    _t.sidebar.show().width(_t.sideWidth);
                }
                _t.layout();
                _t.play(_t.active);
                $(window).on('resize.picasa', function() {
                    _t.layout();
                });
            }
        }
    return function(config) {
        return UI(_.create(defaults, config));
    }
});
