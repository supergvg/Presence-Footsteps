'use strict';

angular.module('gliist', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngResource',
    'ngMessages',
    'ui.router',
    'ngMaterial',
    'ngMdIcons',
    'angularFileUpload',
    'googlechart',
    'ngAutocomplete',
    'ui.bootstrap',
    'ui.bootstrap.datetimepicker',
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.cellNav',
    'ui.grid.selection',
    'ui.grid.autoResize',
    'ui.select',
    'angular-google-analytics'])
    .config(['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider', '$mdThemingProvider', '$mdIconProvider', '$locationProvider', 'AnalyticsProvider', '$windowProvider',
        function ($stateProvider, $urlRouterProvider, $provide, $httpProvider, $mdThemingProvider, $mdIconProvider, $locationProvider, AnalyticsProvider, $windowProvider) {
//            $locationProvider.html5Mode(true);

            AnalyticsProvider
                .useAnalytics(false)
                .setAccount('UA-63764118-2')
                .trackPages(true)
                .setPageEvent('$stateChangeSuccess');

            var customPrimary = {
                '50': '#80eeff',
                '100': '#66ebff',
                '200': '#4de7ff',
                '300': '#33e4ff',
                '400': '#1ae0ff',
                '500': '#00ddff',
                '600': '#00c7e6',
                '700': '#00b1cc',
                '800': '#009bb3',
                '900': '#008599',
                'A100': '#99f1ff',
                'A200': '#b3f5ff',
                'A400': '#ccf8ff',
                'A700': '#006e80'
            };
            $mdThemingProvider.definePalette('customPrimary', customPrimary);
            $mdThemingProvider.theme('default')
                .primaryPalette('customPrimary')
                //.accentPalette('grey')
                .warnPalette('red')
                .backgroundPalette('grey');
                
            var $window = $windowProvider.$get();
//            $window.redirectUrl = 'http://gjests.azurewebsites.net/';         // Production
//            $window.redirectUrl = 'http://gjests-staging.azurewebsites.net/';   // Staging
            $window.redirectUrl = 'http://gjests-api.ideas-implemented.com/';   // Development
            $provide.factory('myHttpInterceptor', function() {
                return {
                    'request': function (config) {

                        var redirectUrl = $window.redirectUrl;
                        if (config.url.indexOf('api') > -1) {
                            config.url = redirectUrl + config.url;
                        } else if (config.url.indexOf('Token') > -1) {
                            config.url = redirectUrl + config.url;
                        }

                        return config;
                    }
                };
            });

            $mdIconProvider
                .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
                .defaultIconSet('img/icons/sets/core-icons.svg', 24);


            $httpProvider.interceptors.push('myHttpInterceptor');

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'app/templates/home.html',
                    access: {
                        allowAnonymous: true,
                        denyLogged: true
                    }
                }).state('signup', {
                    url: '/signup',
                    templateUrl: 'app/user/templates/signup.html',
                    controller: 'SignupCtrl',
                    access: {
                        allowAnonymous: true,
                        denyLogged: true
                    }
                }).state('recover_password', {
                    url: '/recover_password',
                    templateUrl: 'app/user/templates/recover-password.html',
                    controller: 'RecoverPasswordCtrl',
                    access: {
                        allowAnonymous: true,
                        denyLogged: true
                    }
                }).state('reset_password', {
                    url: '/reset_password/:token',
                    templateUrl: 'app/user/templates/reset-password.html',
                    controller: 'ResetPasswordCtrl',
                    access: {
                        allowAnonymous: true,
                        denyLogged: true
                    }
                }).state('signup_invite', {
                    url: '/signup/invite/:company/:token',
                    templateUrl: 'app/user/templates/signup-invite.html',
                    controller: 'SignupInviteCtrl',
                    access: {
                        allowAnonymous: true,
                        denyLogged: true
                    }
                }).state('main', {
                    url: '/main',
                    templateUrl: 'app/templates/main.html',
                    controller: 'MainCtrl'
                }).state('main.user', {
                    url: '/user',
                    templateUrl: 'app/user/templates/profile.html',
                    controller: 'ProfileCtrl'
                }).state('main.create_event', {
                    url: '/create?view',
                    templateUrl: 'app/templates/create-event.html',
                    reloadOnSearch: false,
                    controller: 'EventsCtrl'
                }).state('main.create_gl_event', {
                    url: '/event/edit/guestlist/:eventId/:instanceType',
                    templateUrl: 'app/events/templates/event-add-guestlist.html',
                    controller: 'AddGLEventCtrl'
                }).state('main.edit_gl_event', {
                    url: '/event/edit/guestlistinstance/:gli/:eventId',
                    templateUrl: 'app/events/templates/event-edit-guestlist.html',
                    controller: 'EditGLEventCtrl'
                }).state('main.edit_event', {
                    url: '/event/edit/:eventId?view',
                    templateUrl: 'app/events/templates/edit-event.html',
                    controller: 'EditEventCtrl'
                }).state('main.event_summary', {
                    url: '/event/summary/:eventId',
                    templateUrl: 'app/events/templates/event-summary.html',
                    controller: 'EventSummaryCtrl'
                }).state('main.event_checkin', {
                    url: '/event/checkin/:eventId',
                    templateUrl: 'app/events/templates/event-checkin.html',
                    controller: 'EventCheckinCtrl'
                }).state('main.check_guest', {
                    url: '/event/guest/checkin/:gliId/:guestId',
                    templateUrl: 'app/guest-lists/templates/guest-checkin.html',
                    controller: 'CheckGuestCtrl'
                }).state('main.event_stats', {
                    url: '/event/stats/:eventId',
                    templateUrl: 'app/events/templates/event-stats.html',
                    controller: 'EventsStatsCtrl'
                }).state('main.current_events', {
                    url: '/current_events',
                    templateUrl: 'app/templates/current-events.html',
                    controller: 'EventsCtrl'
                }).state('main.past_events', {
                    url: '/past_events',
                    templateUrl: 'app/templates/past-events.html',
                    controller: 'EventsCtrl'
                }).state('main.list_management', {
                    url: '/list_management',
                    templateUrl: 'app/templates/list-management.html',
                    controller: 'GuestListCtrl'
                }).state('main.edit_glist', {
                    url: '/edit_list_management/:listId',
                    templateUrl: 'app/guest-lists/templates/edit-list-management.html',
                    controller: 'EditGuestListCtrl'
                }).state('main.create_list_management', {
                    url: '/create_list_management',
                    templateUrl: 'app/guest-lists/templates/create-list-management.html',
                    controller: 'GuestListCtrl'
                }).state('main.stats', {
                    url: '/stats',
                    templateUrl: 'app/templates/stats.html',
                    controller: 'StatsCtrl'
                }).state('main.email_stats', {
                    url: '/email_stats/:eventId?view',
                    templateUrl: 'app/events/templates/email-stats.html',
                    controller: 'EmailStatsController'
                }).state('main.welcome', {
                    url: '/welcome',
                    templateUrl: 'app/templates/welcome.html',
                    controller: 'WelcomeController'
                }).state('landing_public', {
                    url: '/rsvp/:companyName/:eventName',
                    templateUrl: function ($stateParams){
                        return 'app/landing/templates/landing'+($stateParams.companyName.toLowerCase() === 'popsugar' ? '-custom' : '')+'.html';
                    },
                    controller: 'LandingCtrl',
                    access: {
                        allowAnonymous: true
                    }
                }).state('landing_personal', {
                    url: '/rsvp/:token',
                    templateUrl: 'app/landing/templates/landing.html',
                    controller: 'LandingCtrl',
                    access: {
                        allowAnonymous: true
                    }
                }).state('landing_personal_custom', {
                    url: '/rsvp-custom/:token',
                    templateUrl: 'app/landing/templates/landing-custom.html',
                    controller: 'LandingCtrl',
                    access: {
                        allowAnonymous: true
                    }
                }).state('landing_ticketing_public', {
                    url: '/tickets/:companyName/:eventName',
                    templateUrl: 'app/landing/templates/landing-ticketing.html',
                    controller: 'LandingTicketCtrl',
                    access: {
                        allowAnonymous: true
                    }
                }).state('landing_ticketing_personal', {
                    url: '/tickets/:token',
                    templateUrl: 'app/landing/templates/landing-ticketing.html',
                    controller: 'LandingTicketCtrl',
                    access: {
                        allowAnonymous: true
                    }
                });
            $urlRouterProvider.otherwise('/main/welcome');
        }])
    .run(['$rootScope', '$state', 'userService', '$document', 'Analytics', 
        function ($rootScope, $state, userService, $document, Analytics) {

            $document.on('keydown', function (event) {
                var doPrevent = false;
                if (event.keyCode === 8) {
                    var d = event.srcElement || event.target;
                    if ((d.tagName.toUpperCase() === 'INPUT' &&
                        (
                            d.type.toUpperCase() === 'TEXT' ||
                            d.type.toUpperCase() === 'PASSWORD' ||
                            d.type.toUpperCase() === 'FILE' ||
                            d.type.toUpperCase() === 'EMAIL' ||
                            d.type.toUpperCase() === 'SEARCH' ||
                            d.type.toUpperCase() === 'NUMBER' ||
                            d.type.toUpperCase() === 'DATE' )
                        ) ||
                        d.tagName.toUpperCase() === 'TEXTAREA') {
                        doPrevent = d.readOnly || d.disabled;
                    }
                    else {
                        doPrevent = true;
                    }
                }

                if (doPrevent) {
                    event.preventDefault();
                }
            });

            $rootScope.$on('$stateChangeStart', function(event, next, toParams, from, fromParams) {
                $state.previous = from;
                $state.previousParams = fromParams;
                if (next.access && next.access.denyLogged && $rootScope.currentUser) {
                    $state.go('main.welcome');
                    event.preventDefault();
                }
                if (!(next.access && next.access.allowAnonymous)) {
                    if (!$rootScope.currentUser) {
                        if (!userService.getLogged()) {
                            $state.go('home');
                            event.preventDefault();
                        } else {
                            userService.getCurrentUser().then(function(user) {
                                $rootScope.currentUser = user;
                                if ($rootScope.currentUser.permissions !== 'admin') {
                                    if ($rootScope.permissions[$rootScope.currentUser.permissions].denyAccess.indexOf($state.current.name) > -1) {
                                        $state.go('home');
                                        event.preventDefault();
                                    }
                                }
                            }, function() {
                                $state.go('home');
                                event.preventDefault();
                            });
                        }
                    }
                }
                if (!$rootScope.appReady) {
                    angular.element('#loading').remove();
                    $rootScope.appReady = true;
                }
            });
        }
    ]);