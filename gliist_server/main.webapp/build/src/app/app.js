angular.module('agora')

    .config(function ($stateProvider, $urlRouterProvider) {
        'use strict';
        // any illegal url (e.g. '/servers/nothing-here') will route to /home
        $urlRouterProvider.otherwise('home');

        $stateProvider.state('home', {
            url: '/home',
            templateUrl: 'home/templates/agora-main.tpl.html',
            controller: 'agoraMainCtrl',
            data: { pageTitle: 'Welcome To Agora' }
        });
    })

    .controller('agoraMainCtrl', function ($scope) {
        'use strict';
    })

    .run(['$rootScope', '$state', '$stateParams', '$location', 'authenticationService', 'appStateService', 'signalRService',
        function ($rootScope, $state, $stateParams, $location, authenticationService, appStateService, signalRService) {
            'use strict';
            // It's very handy to add references to $state and $stateParams to the $rootScope
            // so that you can access them from any scope within your applications.For example,
            // <li ng-class="{ active: $state.includes('storm.reports') }"> will set the <li>
            // to active whenever 'storm.reports' or one of its decedents is active.

            $rootScope.alerts = [];

            $rootScope.danger = function (msg) {
                $rootScope.alerts.push({ msg: msg, type: 'danger' });
            };

            $rootScope.$on('$stateChangeStart', function (event, next, current) {

                if (authenticationService.getLogged()) {

                    if (!appStateService.getUser()) {
                        //user has login data in cookie,
                        authenticationService.getCurrentUser(function (user) {
                            $rootScope.currentUser = user;
                        },
                         function (error) {
                             $rootScope.danger('state change start error:' + JSON.stringify(error));
                         });
                    }

                    if (next.name === 'welcome') {
                        $state.go('home', {}, { notify: true }); //when logged in always go by default to home 
                        event.preventDefault();
                    }
                    return; //user is logged in, do nothing
                }
                if (!next.access) {
                    //User is not logged in and anonymous access is not defined 
                    $state.go('welcome', {}, { notify: true });
                    //$state.transitionTo('/welcome');
                    event.preventDefault();
                    return;
                }
                if (next.access.allowAnonymous) {
                    //next page allows anonymous access, continue;
                    return;
                }
                else {
                    throw new Error("Invalid Login State");
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState) {
                if (angular.isDefined(toState.data.pageTitle)) {
                    $rootScope.pageTitle = ' Agora | ' + toState.data.pageTitle;
                }

            });

            $rootScope.$watch(appStateService.getUser, function (newValue, oldValue) {
                $rootScope.currentUser = newValue;
            });

            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;

            signalRService.initialize();

            $rootScope.logout = function () {
                authenticationService.logout();
                $state.go('welcome');
            };

        }])
;