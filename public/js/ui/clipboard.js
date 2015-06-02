/*
 * copy 
 * clipboardData.setData('Text','xxx');
 * clipboard(elem,fn)
 * clipboard(elem,'proxy',fn)
 */
define(function(require, exports, module) {
    var namespace = '.ecopy_' + _.uniqueId();
    if (UI.browser.firefox || UI.browser.safari) {
        //insert
        var movie, wrap, firstOut = 0,
            width = 200, //估计最大宽度和高度
            height = 100,
            moviePath = require.resolve('./') + 'clipboard.swf',
            curBtn, //当前button
            flashvars = 'width=' + width + '&height=' + height,
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
                }
            },
            copy = function(txt) {
                movie.setText(txt);
                //flash复制肯定OK
                return 1;
            };
        // all other browsers get an EMBED tag
        movie = $('<embed src="' + moviePath + '" loop="false" menu="false" quality="best" bgcolor="#ffffff" width="' + width + '" height="' + height + '" align="middle" allowScriptAccess="always" allowFullScreen="false" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="' + flashvars + '" wmode="transparent" />')[0];
        wrap = $('<div style="position:absolute;left:-1000px;top:100px;overflow:hidden;z-index:125058687">').append(movie).appendTo('body');
        // mouseover mouseout mouseover
        return function(elem, proxy, fn) {
            if (!fn) {
                fn = proxy;
                proxy = '';
            }
            $(elem).off(namespace).on('mouseover' + namespace, proxy, function(e) {
                //当mouseout没触发的时候补充
                if (firstOut > 1) {
                    firstOut = 1;
                    curBtn.trigger('mouseout');
                }
                curBtn = $(this);
                wrap.css({
                    width: curBtn.outerWidth(),
                    height: curBtn.outerHeight(),
                    top: curBtn.offset().top,
                    left: curBtn.offset().left
                });
                firstOut++;
            }).on('mousedown' + namespace, proxy, function(e) {
                fn.call(this, copy);
            }).on('mouseout' + namespace, proxy, function(e) {
                //not first time
                if (firstOut > 1) {
                    firstOut = 0;
                    wrap.css('left', -1000);
                }
            });
        }
    }

    //不使用clipboardData
    var helper = $('<textarea>', {
            value: 1,
            style: 'position: absolute;top:-100px;left:-100px;'
        }).appendTo('body'),
        clip = function(txt) {
            helper.val(txt).select();
            return document.execCommand('copy');
        }
    return function(elem, proxy, fn) {
        if (!fn) {
            fn = proxy;
            proxy = '';
        }
        $(elem).off(namespace).on('click', proxy, function(e) {
            fn.call(this, clip);
        });
    }
});
/*
package 
{
    import flash.display.*;
    import flash.events.*;
    import flash.external.*;
    import flash.system.*;

    public class ZeroClipboard extends Sprite
    {
        private var button:Sprite;
        private var id:String = "";
        private var clipText:String = "";

        public function ZeroClipboard()
        {
            stage.scaleMode = StageScaleMode.EXACT_FIT;
            Security.allowDomain("*");
            var flashvars:* = LoaderInfo(this.root.loaderInfo).parameters;
            id = flashvars.id;
            button = new Sprite();
            button.buttonMode = true;
            button.useHandCursor = true;
            button.graphics.beginFill(13434624);
            button.graphics.drawRect(0, 0, Math.floor(flashvars.width), Math.floor(flashvars.height));
            button.alpha = 0;
            addChild(button);
            button.addEventListener(MouseEvent.CLICK, clickHandler);
            button.addEventListener(MouseEvent.MOUSE_OVER, 
function (param1:Event)
{
    ExternalInterface.call("ZeroClipboard.dispatch", id, "mouseOver", null);
    return;
}// end function
);
            button.addEventListener(MouseEvent.MOUSE_OUT, 
function (param1:Event)
{
    ExternalInterface.call("ZeroClipboard.dispatch", id, "mouseOut", null);
    return;
}// end function
);
            button.addEventListener(MouseEvent.MOUSE_DOWN, 
function (param1:Event)
{
    ExternalInterface.call("ZeroClipboard.dispatch", id, "mouseDown", null);
    return;
}// end function
);
            button.addEventListener(MouseEvent.MOUSE_UP, 
function (param1:Event)
{
    ExternalInterface.call("ZeroClipboard.dispatch", id, "mouseUp", null);
    return;
}// end function
);
            ExternalInterface.addCallback("setHandCursor", setHandCursor);
            ExternalInterface.addCallback("setText", setText);
            ExternalInterface.call("ZeroClipboard.dispatch", id, "load", null);
            return;
        }// end function

        public function setHandCursor(param1:Boolean)
        {
            button.useHandCursor = param1;
            return;
        }// end function

        private function clickHandler(param1:Event) : void
        {
            System.setClipboard(clipText);
            ExternalInterface.call("ZeroClipboard.dispatch", id, "complete", clipText);
            return;
        }// end function

        public function setText(param1)
        {
            clipText = param1;
            return;
        }// end function

    }
}


 */