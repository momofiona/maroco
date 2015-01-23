/*
 * router
 * hash中不允许带:()和*
 */
define(function(require, exports, module) {
    var _oldHash,
        all = /\*.*$/,
        part = /([^\/]?)\:[^\/]*/g,
        escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g,
        route = _.memoize(function(ru) {
            return new RegExp('^#?' + ru.replace(escapeRegExp, '\\$&').replace(all, '(.*)').replace(part, '$1([^\/]*)') + '$');
        });
    return function(routeConfig) {
        $(window).on('hashchange', function() {
            var hash = location.hash;
            $.each(routeConfig, function(k, v) {
                var choice = hash.match(route(k));
                if (choice) {
                    var fn = _.isString(v) ? routeConfig[v] : v;
                    fn.apply(routeConfig, choice.slice(1));
                    return false;
                }
            });
        }).trigger('hashchange');
        //IE8-
        if (_oldHash === undefined) {
            _oldHash = location.hash;
            if (!('onhashchange' in window)) {
                setInterval(function() {
                    var hash = location.hash;
                    if (hash !== _oldHash) {
                        _oldHash = hash;
                        $(window).trigger('hashchange');
                    }
                }, 100);
            }
        }
        //主动触发第一次

    }
});
