// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova']);


app.config(function ($stateProvider, $urlRouterProvider, $provide, $httpProvider) {

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
        .state('login', {
            url: '/login',
            controller: 'loginController',
            templateUrl: 'app/templates/login.html'
        })
        .state('app', {
            url: "/app",
            abstract: true,
            templateUrl: "app/templates/menu.html",
            controller: 'menuController'
        })
        .state('app.home', {
            url: '/home',
            views: {
                'menuContent': {
                    templateUrl: 'app/templates/home.html',
                    controller: 'homeController'
                }
            }
        })
        .state('app.guest', {
            url: '/guest/:guestId',
            views: {
                'menuContent': {
                    controller: 'guestController',
                    templateUrl: 'app/templates/guest.html'
                }
            }
        })
        .state('app.scanBarcode', {
            url: '/barcode',
            views: {
                'menuContent': {
                    controller: 'scanBarcodeController',
                    templateUrl: 'app/templates/scan-barcode.html'
                }
            }
        })
        .state('app.event', {
            url: '/event',
            views: {
                'menuContent': {
                    controller: 'eventController',
                    templateUrl: 'app/templates/event.html'
                }
            }
        });

    $urlRouterProvider.otherwise("/login");

});

app.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
})
