/* To avoid CSS expressions while still supporting IE 7 and IE 6, use this script */
/* The script tag referencing this file must be placed before the ending body tag. */

/* Use conditional comments in order to target IE 7 and older:
	<!--[if lt IE 8]><!-->
	<script src="ie7/ie7.js"></script>
	<!--<![endif]-->
*/

(function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
		'f-plus-alt': '&#xe603;',
		'f-minus-alt': '&#xe604;',
		'f-close-alt': '&#xe601;',
		'f-check-alt': '&#xe600;',
		'f-denied': '&#xe602;',
		'f-plus': '&#xea0a;',
		'f-minus': '&#xea0b;',
		'f-checkmark': '&#xea10;',
		'f-cross': '&#xea0f;',
		'f-edit': '&#xe905;',
		'f-bin': '&#xf014;',
		'f-eye': '&#xf06e;',
		'f-search': '&#xe986;',
		'f-loop': '&#xea2e;',
		'f-cancel-circle': '&#xea0d;',
		'f-shutdown': '&#xe9b6;',
		'f-envelop': '&#xf003;',
		'f-home': '&#xf015;',
		'f-location': '&#xe948;',
		'f-alert': '&#xe950;',
		'f-calendar': '&#xe953;',
		'f-print': '&#xe954;',
		'f-undo': '&#xe967;',
		'f-lock': '&#xe98f;',
		'f-unlock': '&#xe990;',
		'f-tool': '&#xe991;',
		'f-gear': '&#xf013;',
		'f-power': '&#xe9b5;',
		'f-org': '&#xe9bc;',
		'f-attachment': '&#xe9cd;',
		'f-down': '&#xe9c7;',
		'f-upload': '&#xe9c8;',
		'f-tile': '&#xf00a;',
		'f-list': '&#xf00b;',
		'f-help': '&#xf059;',
		'f-info': '&#xf05a;',
		'f-warning': '&#xf071;',
		'f-ar-b': '&#xf0d7;',
		'f-ar-t': '&#xf0d8;',
		'f-ar-l': '&#xf0d9;',
		'f-ar-r': '&#xf0da;',
		'f-ar-bt': '&#xf0dc;',
		'f-aro-l': '&#xf104;',
		'f-aro-r': '&#xf105;',
		'f-aro-t': '&#xf106;',
		'f-aro-b': '&#xf107;',
		'f-more': '&#xf141;',
		'f-bullhorn': '&#xe05f;',
		'f-smile': '&#xe320;',
		'f-sad': '&#xe324;',
		'f-link': '&#xe005;',
		'0': 0
		},
		els = document.getElementsByTagName('*'),
		i, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		c = el.className;
		c = c.match(/f-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
}());
