// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova']);


app.config(['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $provide, $httpProvider) {
        $provide.factory('myHttpInterceptor',
            function () {
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
            }).state('app.alerts', {
                url: '/alerts',
                views: {
                    'menuContent': {
                        controller: 'alertsController',
                        templateUrl: 'app/alerts/templates/alerts.html'
                    }
                }
            }).state('app.past_events', {
                url: '/past_events',
                views: {
                    'menuContent': {
                        templateUrl: 'app/events/templates/event-past.html',
                        controller: 'pastEventController'
                    }
                }
            })
            .state('app.check_guest', {
                url: '/event/checkin/:gliId/:guestId',
                views: {
                    'menuContent': {
                        controller: 'checkGuestController',
                        templateUrl: 'app/guests/templates/check-guest.html'
                    }
                }
            })
            .state('app.add_guest', {
                url: '/event/add/:guestId/:eventId',
                views: {
                    'menuContent': {
                        controller: 'addGuestController',
                        templateUrl: 'app/guests/templates/add-guest.html'
                    }
                }
            })
            .state('app.view_guests', {
                url: '/event/guests/:eventId',
                views: {
                    'menuContent': {
                        controller: 'viewGuestListController',
                        templateUrl: 'app/guests/templates/view-guest-list.html'
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
                url: '/event/:eventId',
                views: {
                    'menuContent': {
                        controller: 'eventController',
                        templateUrl: 'app/templates/event.html'
                    }
                }
            }).state('app.stats', {
                url: '/stats',
                views: {
                    'menuContent': {
                        controller: 'statsController',
                        templateUrl: 'app/events/templates/event-stats.html'
                    }
                }
            }).state('app.user_profile', {
                url: '/profile',
                views: {
                    'menuContent': {
                        controller: 'userController',
                        templateUrl: 'app/user/templates/user-profile.html'
                    }
                }
            }).state('app.event_stats', {
                url: '/stats/:eventId',
                views: {
                    'menuContent': {
                        controller: 'statsController',
                        templateUrl: 'app/events/templates/event-stats.html'
                    }
                }
            });

        $urlRouterProvider.otherwise("/login");

    }]);

app.run(function ($ionicPlatform, userService, $rootScope, $state, $cordovaPush) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }

        if (userService.getLogged() && !$rootScope.currentUser) {
            //user has login data in cookie,
            userService.getCurrentUser().then(function (user) {
                $rootScope.currentUser = user;
            }, function () {
                $state.go('login');
            }).finally(function () {
                $timeout(function () {
                    $rootScope.appReady = true;
                });
            });

            return; //user is logged in, do nothing
        }
        var iosConfig = {
            "badge": true,
            "sound": true,
            "alert": true
        };

        document.addEventListener("deviceready", function () {
            $cordovaPush.register(iosConfig).then(function (deviceToken) {
                // Success -- send deviceToken to server, and store for future use
                console.log("deviceToken: " + deviceToken)
                //$http.post("http://server.co/", {user: "Bob", tokenID: deviceToken})
            }, function (err) {
                //alert("Registration error: " + err)
            });
        });
    });
})
