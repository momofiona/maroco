/*
 * @preserve Router
 * @description An easy tool for hashchange
 * @author momo
 * @version 1.0
 * @example router({
            'layout/:id': function(id) {
                //trigger when location.hash='layout/12'
                //and id will eaqual '12'
            },
            "*": function(hash) {
                //trigger when no other compart above
            }
        });
 */
define(function(require, exports, module) {
    var _oldHash,
        hmark=/^#!?/,
        all = /\*.*$/,
        part = /([^\/]?)\:[^\/]*/g,
        escapeRegExp = /[\-{}\[\]\(\)+?.,\\\^$|#\s]/g,
        route = _.memoize(function(ru) {
            return new RegExp('^' + ru.replace(hmark,'').replace(escapeRegExp, '\\$&').replace(all, '(.*)').replace(part, '$1([^\/]*)') + '$');
        });
    return function(routeConfig) {
        $(window).on('hashchange', function() {
            var hash = location.hash.replace(hmark,'');
            //hash可能为空
            $.each(routeConfig, function(k, v) {
                if(k.charAt(0)!=="#") return;
                var choice = hash.match(route(k));
                if (choice) {
                    (_.isFunction(v)?v:routeConfig[v]).apply(routeConfig, choice.slice(1));
                    return false;
                }
            });
        }).trigger('hashchange');
        //IE8-
        if (_oldHash === undefined) {
            _oldHash = location.hash;
            //IE调试模式下IE7也有onhashchange属性
            if (!('onhashchange' in window)||UI.browser.ie<8) {
                setInterval(function() {
                    var hash = location.hash;
                    if (hash !== _oldHash) {
                        _oldHash = hash;
                        $(window).trigger('hashchange');
                    }
                }, 100);
            }
        }
    }
});
