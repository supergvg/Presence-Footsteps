'use strict';

angular.module('gliist', [
    'ngAnimate',
    'ngCookies',
    'ngTouch',
    'ngSanitize',
    'ngResource',
    'ui.router',
    'ngMaterial',
    'ngMdIcons'])
    .config(['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider',
        function ($stateProvider, $urlRouterProvider, $provide, $httpProvider) {

            $provide.factory('myHttpInterceptor', function () {
                return {
                    'request': function (config) {

                        var redirectUrl = "http://gliist.azurewebsites.net/";
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
                    url: '/create_event',
                    templateUrl: 'app/templates/create-event.html',
                    controller: 'EventsCtrl'
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
                });

            $urlRouterProvider.otherwise('/');
        }])
    .run(['$rootScope', '$state', 'userService',
        function ($rootScope, $state, userService) {
            $rootScope.$on("$stateChangeStart", function (event, next, toParams, from, fromParams) {

                $state.previous = from;
                $state.previousParams = fromParams;

                if (next.access && next.access.allowAnonymous) {
                    return;
                }
                if (!$rootScope.currentUser) {
                    if (userService.getLogged()) {

                    }
                    userService.getCurrentUser().then(function (data) {
                        $rootScope.currentUser = data.user;
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
