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
		'f-home': '&#xe002;',
		'f-browse': '&#xe0a2;',
		'f-user': '&#xe199;',
		'f-star-empty': '&#xe2ff;',
		'f-star': '&#xe301;',
		'f-pencil': '&#xe600;',
		'f-filter': '&#xe443;',
		'f-warn': '&#xe601;',
		'f-calendar': '&#xe603;',
		'f-share': '&#xe48c;',
		'f-read': '&#xe606;',
		'f-bell': '&#xf0a2;',
		'f-more': '&#xf141;',
		'f-save': '&#xf0c7;',
		'f-grid': '&#xf009;',
		'f-down': '&#xe604;',
		'f-up': '&#xe605;',
		'f-org': '&#xe9bc;',
		'f-shutdown': '&#xe9b6;',
		'f-menus': '&#xf05e;',
		'f-add': '&#xe63a;',
		'f-minus': '&#xe63c;',
		'f-multiply': '&#xe60c;',
		'f-checkmark': '&#xe62e;',
		'f-bin': '&#xf014;',
		'f-search': '&#xe607;',
		'f-eye': '&#xf06e;',
		'f-tool': '&#xe991;',
		'f-gear': '&#xf013;',
		'f-info': '&#xe62b;',
		'f-question': '&#xe640;',
		'f-alert': '&#xe950;',
		'f-location': '&#xe948;',
		'f-buy': '&#xe639;',
		'f-denied': '&#xe602;',
		'f-loop': '&#xea2e;',
		'f-turnr': '&#xe613;',
		'f-close': '&#xea0d;',
		'f-print': '&#xe954;',
		'f-undo': '&#xe967;',
		'f-lock': '&#xf06a;',
		'f-unlock': '&#xe990;',
		'f-attachment': '&#xe9cd;',
		'f-link': '&#xf05c;',
		'f-download': '&#xe9c7;',
		'f-upload': '&#xe9c8;',
		'f-list': '&#xf00b;',
		'f-arb': '&#xf0d7;',
		'f-art': '&#xf0d8;',
		'f-arbt': '&#xf0dc;',
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
