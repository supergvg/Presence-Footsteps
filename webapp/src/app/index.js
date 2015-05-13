'use strict';

angular.module('gliist', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ngMaterial',
    'ngMdIcons',
    'angularFileUpload',
    'googlechart',
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.cellNav',
    'ui.grid.selection'])
    .config(['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider', '$mdThemingProvider',
        function ($stateProvider, $urlRouterProvider, $provide, $httpProvider, $mdThemingProvider) {

            $mdThemingProvider.theme('default')
                .primaryPalette('cyan')
                //.accentPalette('grey')
                .warnPalette('red')
                .backgroundPalette('grey');

            window.redirectUrl = "http://gliist.azurewebsites.net/";
            $provide.factory('myHttpInterceptor', function () {
                return {
                    'request': function (config) {

                        var redirectUrl = window.redirectUrl;
                        if (config.url.indexOf('api') > -1) {
                            config.url = redirectUrl + config.url;
                        } else if (config.url.indexOf('Token') > -1) {
                            config.url = redirectUrl + config.url;
                        }

                        return config;
                    }
                };
            });


            $httpProvider.interceptors.push('myHttpInterceptor');

            $stateProvider
                .state('home', {
                    url: '/',
                    templateUrl: 'app/templates/home.html',
                    access: {
                        allowAnonymous: true
                    }
                })
                .state('signup', {
                    url: '/signup',
                    templateUrl: 'app/user/templates/signup.html',
                    controller: 'SignupCtrl',
                    access: {
                        allowAnonymous: true
                    }
                })
                .state('main', {
                    url: '/main',
                    templateUrl: 'app/templates/main.html',
                    controller: 'MainCtrl'
                })
                .state('main.user', {
                    url: '/user',
                    templateUrl: 'app/templates/profile.html',
                    controller: 'ProfileCtrl'
                })
                .state('main.create_event', {
                    url: '/',
                    templateUrl: 'app/templates/create-event.html',
                    controller: 'EventsCtrl'
                }).state('main.create_gl_event', {
                    url: '/event/edit/guestlist/:eventId',
                    templateUrl: 'app/events/templates/event-add-guestlist.html',
                    controller: 'AddGLEventCtrl'
                }).state('main.edit_gl_event', {
                    url: '/event/edit/guestlistinstance/:gli',
                    templateUrl: 'app/events/templates/event-edit-guestlist.html',
                    controller: 'EditGLEventCtrl'
                }).state('main.edit_event', {
                    url: '/event/edit/:eventId',
                    templateUrl: 'app/events/templates/edit-event.html',
                    controller: 'EditEventCtrl'
                }).state('main.event_summary', {
                    url: '/event/summary/:eventId',
                    templateUrl: 'app/events/templates/event-summary.html',
                    controller: 'EventSummaryCtrl'
                })
                .state('main.event_checkin', {
                    url: '/event/checkin/:eventId',
                    templateUrl: 'app/events/templates/event-checkin.html',
                    controller: 'EventCheckinCtrl'
                }).state('main.event_stats', {
                    url: '/event/stats/:eventId',
                    templateUrl: 'app/events/templates/event-stats.html',
                    controller: 'EventsStatsCtrl'
                })
                .state('main.current_events', {
                    url: '/current_events',
                    templateUrl: 'app/templates/current-events.html',
                    controller: 'EventsCtrl'
                }).state('main.past_events', {
                    url: '/past_events',
                    templateUrl: 'app/templates/past-events.html',
                    controller: 'EventsCtrl'
                }).state('main.list_management', {
                    url: '/list_management',
                    templateUrl: 'app/guest-lists/templates/list-management.html',
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
                    templateUrl: 'app/templates/stats/stats.html',
                    controller: 'StatsCtrl'
                });

            $urlRouterProvider.otherwise('/');
        }])
    .run(['$rootScope', '$state', 'userService', '$timeout',
        function ($rootScope, $state, userService, $timeout) {
            $rootScope.$on("$stateChangeStart",
                function (event, next, toParams, from, fromParams) {

                    $state.previous = from;
                    $state.previousParams = fromParams;

                    if (userService.getLogged() && !$rootScope.currentUser) {
                        //user has login data in cookie,
                        userService.getCurrentUser().then(function (user) {
                            $rootScope.currentUser = user;
                            if (next.name === 'home') {
                                $state.go('main', {}, { notify: true }); //when logged in always go by default to home
                                event.preventDefault();
                            }
                        }, function () {
                            return $state.go('home', {}, {
                                notify: true
                            });
                        }).finally(function () {
                            angular.element('#loading').remove();
                            $timeout(function () {
                                $rootScope.appReady = true;
                            });
                        });

                        return; //user is logged in, do nothing
                    }

                    if (!$rootScope.appReady) {
                        angular.element('#loading').remove();

                        $timeout(function () {
                            $rootScope.appReady = true;
                        });
                    }

                    if (next.access && next.access.allowAnonymous) {
                        return;
                    }

                    if (!$rootScope.currentUser) {
                        userService.getCurrentUser().then(function (data) {
                            $rootScope.currentUser = data;
                            if (next.access && next.access.isAdmin) {
                                if (!$rootScope.currentUser.is_admin) {
                                    $state.go('home', {}, {
                                        notify: true
                                    });
                                    return;
                                }
                            }
                            $state.go(next, toParams, {
                                notify: true
                            });
                        }, function () {
                            $rootScope.currentUser = null;
                            return $state.go('home', {}, {
                                notify: true
                            });
                        });
                        return event.preventDefault();
                    }
                    if (!(next.access && next.access.isAdmin)) {
                        return;
                    }
                    if (!$rootScope.currentUser.is_admin) {
                        return $state.go('home', {}, {
                            notify: true
                        });
                    }
                });
        }]);
