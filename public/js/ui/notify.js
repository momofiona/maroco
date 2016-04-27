/*
 * Notify
 *            t
 *       ll l c r rr
 *    tt      |      tt
 *    t       |      t
 *  l c ------------ c  r
 *    b       |      b
 *    bb      |      bb
 *       ll l c r rr
 *            b
 */
define(function(require, exports, module) {
    'use strict';
    //矩形周围16等分
    var positions = {
            //up
            tll: {
                my: 'right bottom',
                at: 'left top-7',
                tip: 'br'
            },
            tl: {
                my: 'left bottom',
                at: 'left top-7',
                tip: 'bll'
            },
            tc: {
                my: 'center bottom',
                at: 'center top-7',
                tip: 'b'
            },
            tr: {
                my: 'right bottom',
                at: 'right top-7',
                tip: 'brr'
            },
            trr: {
                my: 'left bottom',
                at: 'right top-7',
                tip: 'bl'
            },
            //right
            rtt: {
                my: 'left bottom',
                at: 'right+7 top',
                tip: 'lb'
            },
            rt: {
                my: 'left top',
                at: 'right+7 top',
                tip: 'ltt'
            },
            rc: {
                my: 'left center',
                at: 'right+7 center',
                tip: 'l'
            },
            rb: {
                my: 'left bottom',
                at: 'right+7 bottom',
                tip: 'lbb'
            },
            rbb: {
                my: 'left top',
                at: 'right+7 bottom',
                tip: 'lt'
            },
            //bottom
            bll: {
                my: 'right top',
                at: 'left bottom+7',
                tip: 'tr'
            },
            bl: {
                my: 'left top',
                at: 'left bottom+7',
                tip: 'tll'
            },
            bc: {
                my: 'center top',
                at: 'center bottom+7',
                tip: 't'
            },
            br: {
                my: 'right top',
                at: 'right bottom+7',
                tip: 'trr'
            },
            brr: {
                my: 'left top',
                at: 'right bottom+7',
                tip: 'tl'
            },
            //left
            ltt: {
                my: 'right bottom',
                at: 'left-7 top',
                tip: 'rb'
            },
            lt: {
                my: 'right top',
                at: 'left-7 top',
                tip: 'rtt'
            },
            lc: {
                my: 'right center',
                at: 'left-7 center',
                tip: 'r'
            },
            lb: {
                my: 'right bottom',
                at: 'left-7 bottom',
                tip: 'rbb'
            },
            lbb: {
                my: 'right top',
                at: 'left-7 bottom',
                tip: 'rt'
            }
        },
        tips = function(config) {
            config = _.extend({
                msg: '',
                cls: 'dark'
            }, config);
            //必须要有of参数
            config.id = config.id || _.uniqueId('tips_');
            var tips = $('#' + config.id),
                poz = _.create(positions[config.dir || config.of.data('dir') || 'tc'], {
                    id: config.id,
                    of: config.of,
                    collision: 'none',
                    within: config.within
                });
            if (!tips.length) {
                tips = $('<div>', {
                    id: config.id,
                    'style': 'position:absolute;top:300px;left:700px;'
                }).appendTo(config.within || 'body');
            }
            tips[0].className = 'tips ' + config.cls;
            if (config.timeout) {
                setTimeout(function() {
                    tips.remove();
                }, config.timeout * 1000);
            }
            return tips.html(config.msg + '<b class="tip tip-' + poz.tip + '"></b>' + (config.closeable ? '<i class="f f-multiply m4 am-rotate" onclick="$(this).parent().remove();"></i>' : '')).show().position(poz);
        };

    //notify
    var template = _.dot('{{?it.type=="dialog"}}{{?it.closeable!==false}}<i class="f f-multiply dialog-close am-rotate"></i>{{?}}<div class="dialog-title">{{=it.icon}}{{=it.title}}</div><div class="dialog-con">{{=it.msg}}</div>{{?it.buttons}}<div class="dialog-foot">{{~it.buttons :v:i}}<{{=v.tag||"b"}} class="b xr m4 {{=v.cls||"log"}}"{{?v.click}} click="{{=i}}"{{?}}>{{=v.label}}</{{=v.tag||"b"}}>{{~}}</div>{{?}}{{??}}{{=it.icon}}<span class="notify-con">{{=it.msg}}</span>{{?it.closeable}}<i class="f f-multiply notify-close am-rotate"></i>{{?}}{{?}}'),
        defaults = {
            cls: 'log',
            type: 'notify',
            anime: 'am-fadeup',
            icon: '',
            title: '',
            msg: '', //内容
            timeout: 0,
            shadow: true, //box-shadow
            template: template,
            events: {},
            draggable: false,
            mask: false, //是否启用遮罩层
            onclose: $.noop, //UI销毁前调用
            oninit: $.noop, //元素初始化前调用
            oncreate: $.noop, //元素dom创建完毕之后调用
            close: function(e, config) {
                //如果支持动画，监控animate finished 再干掉
                config = config || this;
                //阻止冒泡关闭更上层的dialog或者notify，虽然这种情况很少出现
                e && e.stopPropagation && e.stopPropagation();
                //silent 不触发onclose回调
                e !== true && config.onclose(e, config);
                config.close = $.noop;
                // config.el.removeClass(config.anime).addClass('am-popout');
                config.el.remove();
                delete config.el;
                if (config.mask) {
                    config.mask.remove();
                    delete config.mask;
                }
            },
            position: {
                at: 'center center-40',
                my: 'center',
                // collision :'fit',
                using: function(poz) {
                    if (poz.top < 10) poz.top = 10;
                    $(this).css(poz);
                },
                of: window
            },
            init: function() {
                var _t = this,
                    isDialog = _t.type === 'dialog';
                _t.oninit.apply(_t);
                if (_t.buttons) {
                    _t.buttons.reverse();
                }
                //带buttons、title参数肯定是dialog
                if (_t.buttons || _t.title) {
                    _t.type = 'dialog';
                    isDialog = true;
                }
                // _t.anime = _t.anime ? _t.anime : 'am-fadeup';
                //close event
                var _ename = 'click .' + _t.type + '-close';
                _t.events[_ename] = _t.events[_ename] || 'close';
                if (_t.shadow === false) _t.cls += ' noshadow';
                if (_t.id) _t.el.attr('id', _t.id);
                _t.el.addClass(_t.cls + ' ' + _t.type + ' ' + _t.anime).html(_t.template(_t)).data('_notify_', _t);
                _t.contentEl = _t.$('>.' + _t.type + '-con');
                if (_t['width']) _t.el.css('width', _t['width']);
                if (_t['height']) _t.contentEl.css('height', _t['height']).addClass('scroll');
                /*_.each(['width', 'height', 'maxWidth', 'maxHeight', 'minHeight', 'minWidth'], function(o, i) {
                    if (_t[o]) _t.contentEl.css(o, _t[o]).addClass('scroll');
                });*/
                //button evenet
                if (_t.buttons) {
                    _t.el.find('>.dialog-foot .b[click]').on('click', function(e) {
                        var click = $(this).attr('click'),
                            _op = _t.buttons[click];
                        click = _op.click;
                        //如果是字符串，直接找属性执行
                        if (_.isString(click)) {
                            _t[click](e, _t, _op);
                        } else {
                            click.call(this, e, _t, _op);
                        }

                    });
                }
                //mask
                var _msk = _t.mask;
                if (_msk || isDialog) {
                    _t.mask = $('<div class="mask' + (_msk === true ? ' glass' : '') + '"/>').appendTo('body');
                }
                _t.el.appendTo(_t.mask || 'body');
                _t.oncreate.apply(_t);
                //tips
                var position = _t.position;
                if (_t.tips) {
                    if (_.isString(_t.tips)) {
                        _t.tips = {
                            dir: _t.tips
                        };
                    }
                    var poz = positions[_t.tips.dir];
                    if (poz) {
                        if (_t.tips.of) {
                            position = _.extend(_t.tips, poz, {
                                collision: 'none'
                            });
                        }
                        if (!_t.tips.el) {
                            _t.tips.el = $('<b class="tip tip-' + poz.tip + '"></b>').appendTo(_t.el.addClass('tips'));
                        } else {
                            _t.tips.el.attr('class', 'tip tip-' + poz.tip);
                        }
                    }
                }
                _t.el.position(position);

                if (_t.timeout) {
                    _t.timer = setTimeout(function() {
                        _t.close();
                    }, _t.timeout * 1000);
                }
                //drag & resize
                if (_t.draggable) {
                    require.async('draggable', function() {
                        _t.el.draggable({
                            handle: isDialog ? ">.dialog-title" : '',
                            drag: function(event, ui) {
                                if (ui.position.top < 0) ui.position.top = 0;
                            }
                        });
                    });
                }
            }
        };
    //创建元素
    var dialog = function(option) {
        if (option.id) {
            var d = $('#' + option.id);
            if (d.length) return d.data('_notify_');
        }
        option = _.extend(_.create(defaults), option);
        return UI(option);
    };
    _.extend(dialog, {
        tips: tips,
        loading: function(config) {
            return this(_.extend({
                icon: '<i class="i i-loading m2"></i>',
                cls: 'nobg noshadow',
                mask: 1 //1 和 true 是有区别的
            }, config));
        },
        /*        verify: function(config) {
                    if (config.test) {
                        config.callback && config.callback(true);
                    }
                    return this(_.extend({
                        cls: 'note',
                        icon: '<i class="m2 f-lg f f-warn va-m"></i>',
                        closeable: true,
                        mask: true,
                        oninit: function() {
                            this.msg = '<span class="va-m" style="display:inline-block">' + this.msg + '</span><i class="f f-lg f-done notify-checkmark" title="确定"></i>';
                            this.events = {
                                'click .notify-checkmark': 'doVerify',
                                'click .notify-close': 'doVerify'
                            }
                            this.el.css('padding', 30);
                            this.doVerify = function(e, _config) {
                                _config.close();
                                config.callback && config.callback($(this).hasClass('notify-checkmark'));
                            }
                        }
                    }, config));
                },*/
        confirm: function(config) {
            if (config.test) {
                config.callback && config.callback(true);
                return;
            }
            return this(_.extend({
                icon: '<i class="mr f f-warn"></i>',
                mask: true,
                title: '请确认',
                buttons: [{
                    label: '<i class="f mr f-done"></i>确定',
                    tag:'button',
                    cls: (config.okCls||'note')+" ac-confirm-ok",
                    click: 'doComfirm'
                }, {
                    label: '取消',
                    tag:'button',
                    click: 'doComfirm'
                }],
                doComfirm: function(e, _config, op) {
                    _config.callback && _config.callback(!!op.cls);
                    _config.close(e, _config);
                },
                create: function() {
                    this.contentEl.css('padding', 20);
                    this.$('.ac-confirm-ok').focus();
                }
            }, config));
        }
    });
    var notifyIcon = 'info bell warn tool done'.split(' ');
    _.each(['info', 'note', 'warn', 'error', 'safe'], function(o, i) {
        dialog[o] = function(msg, timeout) {
            if (_.isString(msg)) {
                msg = {
                    msg: msg
                }
            }
            return this(_.extend({
                cls: o,
                icon: '<i class="m2 f-lg f f-' + notifyIcon[i] + '"></i>',
                timeout: timeout || 2
            }, msg));
        }
    });
    return dialog;
});
