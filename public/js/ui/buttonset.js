/**
 * buttonset
 * @param  {[type]} require [description]
 */
define(function(require, exports, module) {
    var watch = require('ui/watch'),
        dot = require('dot');
    var defaults = {
        cls: 'link',
        multi: false //多选
    }
    var btnSet = Backbone.View.extend({
        events: {
            "dblclick": "open",
            "click .icon.doc": "select",
            "contextmenu .icon.doc": "showMenu",
            "click .show_notes": "toggleNotes",
            "click .title .lock": "editAccessLevel",
            "mouseover .title .date": "showTooltip"
        },

        render: function() {
            this.$el.html(this.template(this.model.attributes));
            return this;
        },

        open: function() {
            window.open(this.model.get("viewer_url"));
        },

        select: function() {
            this.model.set({
                selected: true
            });
        }
    });
    var tmp = dot.template('{{~it.data :v:i}}<b class="b {{it.cls}}">{{v.label}}</b>{{~}}');
    var buttonset = function(dom, config) {
        config = _.extend({}, defaults, config);
        $()
    }
    return buttonset;
});
