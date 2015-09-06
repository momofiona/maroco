/**
 * event
 */
define({
    on: function(name, callback, context) {
        this._events || (this._events = {});
        var events = this._events[name] || (this._events[name] = []);
        events.push({
            callback: callback,
            context: context,
            ctx: context || this
        });
        return this;
    },
    one: function(name, callback, context) {
        var self = this;
        var once = _.once(function() {
            self.off(name, once);
            callback.apply(this, arguments);
        });
        once._callback = callback;
        return this.on(name, once, context);
    },
    off: function(name, callback, context) {
        var retain, ev, events, names, i, l, j, k;
        if (!this._events) return this;
        if (!name && !callback && !context) {
            this._events = void 0;
            return this;
        }
        names = name ? [name] : _.keys(this._events);
        for (i = 0, l = names.length; i < l; i++) {
            name = names[i];
            if (events = this._events[name]) {
                this._events[name] = retain = [];
                if (callback || context) {
                    for (j = 0, k = events.length; j < k; j++) {
                        ev = events[j];
                        if ((callback && callback !== ev.callback && callback !== ev.callback._callback) ||
                            (context && context !== ev.context)) {
                            retain.push(ev);
                        }
                    }
                }
                if (!retain.length) delete this._events[name];
            }
        }
        return this;
    },
    trigger: function(name) {
        if (!this._events) return this;
        _.each(this._events[name], function(o, i) {
            o.callback.apply(ev.ctx, arguments);
        });
        return this;
    }
});
