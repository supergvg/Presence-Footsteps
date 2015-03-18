/**
 * This file is the registry for all modules in the application.
 * When ever a new module is being added, it must be declared here to make sure
 * that any file is able to add configuration section to it, regardless of loading order
 * of the javascript files.
 * This file is guaranteed to be loaded first in the application loading order (after vendor files, before
 * application js files).
 *
 * After build, this file is converted into app.modules.js (i.e. 'js' extension is added)
 */


/*Init application sub modules:*/
angular.module('agoraEx', ['ngResource']);
angular.module('agora.services', ['ngResource']);



/*Init Agora main module*/
angular.module('agora', [

	'agora.services',

	/*Auto generated modules*/
	'templates-app',
	'templates-common',

	/*Angular modules*/
	'ngAnimate',
	'ngCookies',
	'ui.router',
	'ngResource',
	'ngRoute',
	'ui.bootstrap',
	'infinite-scroll',
	'angularSpinner',
	

	'template/accordion/accordion-group.html',
	'template/accordion/accordion.html'
]);
