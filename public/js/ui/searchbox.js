define(function(require, exports, module) {
    $.fn.searchbox = function(option) {
        if (this.length != 1) return this;
        option = $.extend({
            value: '',
            cls: '',
            placeholder: '',
            filterWidth: 88,
            search: $.noop,
            input: $.noop
        }, option);
        var _self = this.addClass('search-text text-auto ' + option.cls).html('<div class=""><input value="' + option.value + '" class="text" placeholder="' + option.placeholder + '">\
                </div><b class="i i-cancel"></b>');
        //如果带了分类选择
        var filter,oldValue;
        if (option.filter) {
            _self.css('padding-left', (option.filterWidth) + 5);
            require.async('js/ui.cdropmenu', function() {
                $('<span class="search-filter dicon-down"/>')
                    .width((option.filterWidth) - 16 - 25)
                    .prependTo(_self)
                    .cdropmenu({
                        data: option.filter,
                        create: function(selected, triggerButton) {
                            this.attr('style', 'min-width:' + option.filterWidth + 'px;_width:' + option.filterWidth + 'px').hide();
                        },
                        at: 'left-25 bottom-1',
                        select: function(data, button, dropMenu) {
                            button.text(data.text);
                            filter = data;
                        }
                    });
            });
        }
        var input = this.find('input'),
            cancel = input.parent().next().click(function() {
                $(this).hide();
                input.val('').focus();
                input.trigger('input');
                option.search.call(input, this.value, filter);
            });
        if (oldValue=option.value) cancel.show();
        var callInput=_.throttle(function(input,value, filter){
            if(oldValue!==value){
                option.input.call(input, value, filter);
                oldValue=value;
            }
        },500,{leading: false});
        input.on('input', function() {
            var value=$.trim(this.value);
            callInput(input,value, filter);
            cancel.toggle(!!value);
        }).on('keyup', function(e) {
            if (e.keyCode == "13") {
                option.search.call(input, this.value, filter);
            }
        });
        return this;
    }
});
