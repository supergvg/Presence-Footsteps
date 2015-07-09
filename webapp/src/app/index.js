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
  'ngAutocomplete',
  'ui.bootstrap',
  'ui.bootstrap.datetimepicker',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.cellNav',
  'ui.grid.selection',
  'ui.grid.autoResize'])
  .config(['$stateProvider', '$urlRouterProvider', '$provide', '$httpProvider', '$mdThemingProvider', '$mdIconProvider',
    function ($stateProvider, $urlRouterProvider, $provide, $httpProvider, $mdThemingProvider, $mdIconProvider) {

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

      $mdIconProvider
        .iconSet('social', 'img/icons/sets/social-icons.svg', 24)
        .defaultIconSet('img/icons/sets/core-icons.svg', 24);


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
        .state('recover_password', {
          url: '/recover_password',
          templateUrl: 'app/user/templates/recover-password.html',
          controller: 'RecoverPasswordCtrl',
          access: {
            allowAnonymous: true
          }
        })
        .state('reset_password', {
          url: '/reset_password/:token',
          templateUrl: 'app/user/templates/reset-password.html',
          controller: 'ResetPasswordCtrl',
          access: {
            allowAnonymous: true
          }
        }).state('signup_invite', {
          url: '/signup/invite/:company/:token',
          templateUrl: 'app/user/templates/signup-invite.html',
          controller: 'SignupInviteCtrl',
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
          templateUrl: 'app/user/templates/profile.html',
          controller: 'ProfileCtrl'
        })
        .state('main.create_event', {
          url: '/create?view',
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
        }).state('main.email_stats', {
          url: '/email_stats/:eventId',
          templateUrl: 'app/events/templates/email-stats.html',
          controller: 'EmailStatsController'
        }).state('main.welcome', {
          url: '/welcome',
          templateUrl: 'app/templates/welcome.html',
          controller: 'WelcomeController'
        });

      $urlRouterProvider.otherwise('/main/welcome');
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
                $state.go('main.welcome', {}, {notify: true}); //when logged in always go by default to home
                event.preventDefault();
              }
            }, function () {
              if (next.access && next.access.allowAnonymous) {
                return;
              }
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
