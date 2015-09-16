/*
 * jQuery dropdown: A simple dropdown plugin
 *
 * Copyright A Beautiful Site, LLC. (http://www.abeautifulsite.net/)
 *
 * Licensed under the MIT license: http://opensource.org/licenses/MIT
 *
 */
(function($) {

    $.extend($.fn, {
        dropdown: function(method, data) {
            switch (method) {
                case 'show':
                    show(null, $(this));
                    return $(this);
                case 'hide':
                    hide();
                    return $(this);
                case 'attach':
                    return $(this).data('dropdown', data);
                case 'detach':
                    hide();
                    return $(this).removeData('data-dropdown');
                case 'disable':
                    return $(this).addClass('dropdown-disabled');
                case 'enable':
                    hide();
                    return $(this).removeClass('dropdown-disabled');
            }
        }
    });

    function show(event, object) {
        var trigger = event ? $(this) : object,
            attr = trigger.data('dropdown'),
            dropdown = attr ? $(attr) : trigger.next(),
            isOpen = trigger.hasClass('dropdown-open');
        // In some cases we don't want to show it
        if (event) {
            if ($(event.target).hasClass('dropdown-ignore')) return;

            event.preventDefault();
            event.stopPropagation();
        } else {
            if (trigger !== object.target && $(object.target).hasClass('dropdown-ignore')) return;
        }
        hide();
        if (isOpen || trigger.hasClass('dropdown-disabled')) return;
        // Show it
        trigger.addClass('dropdown-open');
        dropdown.data('dropdown-trigger', trigger).show();
        // Position it
        position();
        // Trigger the show callback
        dropdown.trigger('show', {
            dropdown: dropdown,
            trigger: trigger
        });
    }

    function hide(event) {
        //排除特例火狐鼠标右键会触发document的click
        if (event && event.which == 3) return;
        // In some cases we don't hide them
        var targetGroup = event ? $(event.target).parents().addBack() : null;

        // Are we clicking anywhere in a dropdown?
        if (targetGroup && targetGroup.is('.dropdown')) {
            // Is it a dropdown menu?
            if (targetGroup.is('.dropdown-menu')) {
                // Did we click on an option? If so close it.
                if (!targetGroup.is('A')) return;
            } else {
                // Nope, it's a panel. Leave it open.
                return;
            }
        }
        // Hide any dropdown that may be showing
        $(document).find('.dropdown:visible').each(function() {
            var dropdown = $(this);
            dropdown
                .hide()
                .removeData('dropdown-trigger')
                .trigger('hide', {
                    dropdown: dropdown
                });
        });
        // Remove all dropdown-open classes
        $(document).find('.dropdown-open').removeClass('dropdown-open');
    }

    function position() {
        var dropdown = $('.dropdown:visible').eq(0),
            trigger = dropdown.data('dropdown-trigger');
        if (dropdown.length === 0 || !trigger) {
            return;
        }
        var pos = dropdown.attr('position'),
            top = dropdown.hasClass('tips') ? '+6' : '-1';
        pos = pos ? $.trim(pos).split(',') : [];
        dropdown.position({
            my: pos[0] || 'left top' + top,
            at: pos[1] || 'left bottom',
            of: pos[2] || trigger
        });
    }
    $(document).on('click.dropdown', '[data-dropdown]', show);
    $(document).on('click.dropdown', hide);
    $(window).on('resize.dropdown', position);
}(jQuery));
