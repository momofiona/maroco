/*
 * jQuery Notify
 */
define(function(require, exports, module) {
    var template = _.dot('{{?it.type=="dialog"}}<i class="f f-multiply dialog-close"></i><div class="dialog-title">{{=it.icon}}{{=it.title}}</div><div class="dialog-con">{{=it.msg}}</div>{{?it.buttons}}<div class="dialog-foot">{{~it.buttons :v:i}}<b class="b xr m4 {{=v.cls||"log"}}"{{?v.click}} click="{{=i}}"{{?}}>{{=v.label}}</b>{{~}}</div>{{?}}{{??}}{{=it.icon}}<span class="notify-con">{{=it.msg}}</span>{{?it.closeable}}<i class="f f-multiply notify-close"></i>{{?}}{{?}}');
    var defaults = {
            cls: 'log',
            type: 'notify',
            icon: '',
            title: '',
            msg: '', //内容
            timeout: 0,
            template: template,
            events: {},
            draggable: false,
            mask: false, //是否启用遮罩层
            onclose: $.noop, //UI销毁前调用
            oninit: $.noop, //元素初始化前调用
            oncreate: $.noop, //元素dom创建完毕之后调用
            close: function(e, config) {
                config = config || this;
                config.onclose.apply(config);
                config.close = $.noop;
                config.el.remove();
                delete config.el;
                if (config.mask) {
                    config.mask.remove();
                    delete config.mask;
                }
                if (e) {
                    //阻止冒泡关闭更上层的dialog或者notify，虽然这种情况很少出现
                    e.stopPropagation();
                }
            },
            position: {
                at: 'center 10%',
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
                };
                //带buttons、title参数肯定是dialog
                if (_t.buttons || _t.title) {
                    _t.type = 'dialog';
                    isDialog = true;
                }
                _t.anime = _t.anime ? _t.anime : isDialog ? 'am-fadeup' : 'am-popin';
                //close event
                var _ename = 'click .' + _t.type + '-close';
                _t.events[_ename] = _t.events[_ename] || 'close';
                _t.el.addClass(_t.cls + ' ' + _t.type + ' ' + _t.anime).html(_t.template(_t)).data('_notify_', _t);
                _t.contentEl = _t.$('>.' + _t.type + '-con');
                //button evenet
                if (_t.buttons) {
                    _t.el.find('>.dialog-foot .b[click]').on('click', function(e) {
                        var index = $(this).attr('click');
                        _t.buttons[index].click.call(this, e, _t);
                    });
                }
                if (_t.timeout) {
                    setTimeout(function() {
                        _t.close();
                    }, _t.timeout * 1000);
                }
                //mask
                var _msk = _t.mask;
                if (_msk || isDialog) {
                    _t.mask = $('<div class="mask' + (_msk ? ' glass' : '') + '"/>').appendTo('body');
                }
                _t.el.appendTo(_t.mask || 'body');
                _t.oncreate.apply(_t);
                _t.el.position(_t.position);
                //drag & resize
                if (_t.draggable) {
                    _t.el.draggable({
                        handle: isDialog ? ">.dialog-title" : ''
                    });
                }
                if (_t.resizable) {
                    _t.contentEl.resizable({
                        minWidth: 250,
                        handles: "e" //只允许横向放大
                    });
                }
            }
        }
        //创建元素
    var dialog = function(option) {
        option = _.extend(_.proto(defaults), option);
        return UI(option);
    }
    _.extend(dialog, {
        loading: function(config) {
            return this(_.extend({
                icon: '<i class="i i-loading m2"></i>',
                msg: '加载中'
            }, config));
        },
        confirm: function(config) {
            return this(_.extend({
                cls: 'note',
                icon: '<i class="m2 f-lg f f-warn"></i>',
                closeable: true,
                oninit: function() {
                    this.msg += '<i class="f f-checkmark notify-checkmark"></i>';
                    this.events = {
                        'click .notify-checkmark': 'doConfirm',
                        'click .notify-close': 'doConfirm'
                    }
                    this.el.css('padding', 30);
                    this.doConfirm = function(e, _config) {
                        _config.close();
                        config.callback && config.callback($(this).hasClass('notify-checkmark'));
                    }
                }
            }, config));
        },
        clear: function() {
            $('.notify').each(function() {
                var c = $(this).data('_notify_');
                c && c.close();
            });
        }
    });
    var notifyIcon = 'info bell warn tool checkmark'.split(' ');
    _.each(['info', 'note', 'warn', 'error', 'safe'], function(o, i) {
        dialog[o] = function(msg, timeout) {
            return this({
                cls: o,
                icon: '<i class="m2 f-lg f f-' + notifyIcon[i] + '"></i>',
                msg: msg,
                timeout: timeout == undefined ? 3 : timeout
            });
        }
    });
    return dialog;
});
