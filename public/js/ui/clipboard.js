/*
 * copy
 */
define(function(require, exports, module) {
    //insert
    var movie, wrap, firstOut = 0,
        timmer,
        namespace = '.ecopy_' + _.uniqueId(),
        width = 100, //估计最大宽度和高度
        height = 100,
        moviePath = require.resolve('./') + 'clipboard.swf',
        movieId = 'momoClip',
        curBtn, //当前button
        flashvars = 'id=momoClip&width=' + width + '&height=' + height,
        zclip = window.ZeroClipboard = {
            dispatch: function(id, eventName, args) {
                eventName = eventName.toLowerCase();
                // receive event from flash movie, send to client  
                if (eventName == 'load') {
                    movie.setHandCursor(true);
                } else {
                    /*if (eventName != 'mouseover') */
                    curBtn.trigger(eventName, args);
                }

            },
            position: function() {
                wrap.css({
                    width: curBtn.outerWidth(),
                    height: curBtn.outerHeight(),
                    top: curBtn.offset().top,
                    left: curBtn.offset().left
                })
            }
        };
    //init
    if (UI.browser.ie) {
        // IE gets an OBJECT tag
        movie = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" width="' + width + '" height="' + height + '" id="' + movieId + '" codebase="' + location.protocol + '://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" align="middle"><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="false" /><param name="movie" value="' + moviePath + '" /><param name="loop" value="false" /><param name="menu" value="false" /><param name="quality" value="best" /><param name="bgcolor" value="#ffffff" /><param name="flashvars" value="' + flashvars + '"/><param name="wmode" value="transparent"/></object>';
    } else {
        // all other browsers get an EMBED tag
        movie = '<embed id="' + movieId + '" src="' + moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + width + '" height="' + height + '" name="' + movieId + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + flashvars + '" wmode="transparent" />';
    }
    wrap = $('<div style="position:absolute;left:-1000px;top:100px;overflow:hidden;z-index:125058687">').append(movie = $(movie)[0]).appendTo('body');
    // mouseover mouseout mouseover
    return function(obj) {
        obj.el.off(namespace).on('mouseover' + namespace, function(e, v) {
            //当mouseout没触发的时候补充
            if (firstOut > 1) {
                firstOut = 1;
                curBtn.trigger('mouseout');
            }
            curBtn = $(this);
            zclip.position();
            firstOut++;
        }).on('mousedown' + namespace, function(e) {
            //如果有data-copy 直接拷贝，如果没有则使用copy
            var txt;
            if (_.isFunction(obj.copy)) {
                txt = obj.copy();
            } else {
                txt = curBtn.data('copy');
            }
            movie.setText(txt);
        }).on('mouseout' + namespace, function(e) {
            //not first time
            if (firstOut > 1) {
                firstOut = 0;
                wrap.css('left', -1000);
            }
        });
    }
});
