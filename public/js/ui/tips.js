define(function(require, exports, module) {
    var notify = require('ui/notify');
    var defaults = {
            msg: '',
            cls: 'dark'
        },
        //矩形周围16等分
        positions = {
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
        }

    return function(config) {
        config = _.proto(defaults, config);
        //必须要有of参数
        var tips = $('#'+config.id),
            poz = _.proto(positions[config.dir || 'tll'], {
                id:config.id,
                of: config.of,
                collision: 'none',
                within: config.within
            });
        if (!tips.length) {
            tips = $('<div>', {
                id:config.id,
                'class': 'tips ' + config.cls,
                'style': 'position:absolute;top:50%;left:50%;'
            }).appendTo(config.within || 'body');
        }
        return tips.html(config.msg + '<b class="tip tip-' + poz.tip + '"></b>').show().position(poz);
    }
});
