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
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'app/templates/home.html'
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
    }]).run(['$rootScope', function ($rootScope) {

    }]);
