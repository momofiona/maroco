/*
 * object.watch polyfill in ES5
 *
 * 2014-09-25
 *
 * https://gist.github.com/eligrey/384583
 */
//依赖 underscore
define(function(require, exports, module) {
    if (!Object.prototype.watch) {
        //ie8只实现了dom部分(不完全) 见http://www.cnblogs.com/_franky/archive/2011/04/27/2030766.html
        if (Object.defineProperty && !/MSIE 8.0/.test(navigator.userAgent)) {
            Object.defineProperty(Object.prototype, "watch", {
                // enumerable: false,
                configurable: true,
                // writable: false,
                value: function(prop, handler) {
                    var oldval = this[prop],
                        newval = oldval,
                        getter = function() {
                            return newval;
                        },
                        setter = function(val) {
                            oldval = newval;
                            return newval = handler.call(this, prop, oldval, val);
                        };

                    if (delete this[prop]) { // can't watch constants
                        Object.defineProperty(this, prop, {
                            get: getter,
                            set: setter,
                            enumerable: true,
                            configurable: true
                        });
                    }
                }
            });
            Object.defineProperty(Object.prototype, "unwatch", {
                enumerable: false,
                configurable: true,
                writable: false,
                value: function(prop) {
                    var val = this[prop];
                    delete this[prop];
                    this[prop] = val;
                }
            });
        } else if (Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) {
            Object.prototype.watch = function(prop, handler) {
                var oldval = this[prop],
                    newval = oldval,
                    getter = function() {
                        return newval;
                    },
                    setter = function(val) {
                        oldval = newval;
                        return newval = handler.call(this, prop, oldval, val);
                    };
                Object.prototype.__defineGetter__.call(obj, prop, getter);
                Object.prototype.__defineSetter__.call(obj, prop, setter);
            }
            Object.prototype.unwatch = function(prop) {
                var val = this[prop];
                delete this[prop];
                this[prop] = val;
            }
        }
    }
    /**
     * 监控对象属性变化
     * @param  {Object} obj     需要监控的对象
     * @param  {string} prop    监控的属性 name.scope
     * @param  {function} handler [description]
     */
    var watch = function(obj, prop, handler) {
        var eventpool = obj.__eventpool__ ? obj.__eventpool__ : obj.__eventpool__ = {};
        if (eventpool[prop]) {
            eventpool[prop].push(handler);
        } else {
            eventpool[prop] = [handler];
            obj.watch(prop, function(prop, oldval, newval) {
                if (oldval !== newval) {
                    _.each(eventpool[prop], function(o,i) {
                        o.call(obj, prop, oldval, newval);
                    })
                }
            });
        }
    }
    var unwatch = function(obj, prop) {
        if (obj.__eventpool__) delete obj.__eventpool__[prop];
        var val = obj[prop];
        delete obj[prop];
        obj[prop] = val;
    }
    watch.unwatch=unwatch;
    module.exports=watch;
});
