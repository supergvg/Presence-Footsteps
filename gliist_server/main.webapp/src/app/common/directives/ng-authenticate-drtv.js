angular.module('agora')
.directive('ngAuthenticate', ['$rootScope', 'authenticationService',
    function ($rootScope, authenticationService) {
        'use strict';
        return {
            restrict: 'A',
            scope: {
                ngAuthenticate: '=ngAuthenticate'
            },
            link: function (scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch(authenticationService.getLogged, function (newValue, oldValue) {
                    var loggedIn = newValue;
                    if ((scope.ngAuthenticate && !loggedIn) || (!scope.ngAuthenticate && loggedIn)) {
                        element.css('display', 'none');
                    }
                    else if ((scope.ngAuthenticate && loggedIn) || (!scope.ngAuthenticate && !loggedIn)) {
                        element.css('display', prevDisp);
                    }
                });
            }
        };
    }]);