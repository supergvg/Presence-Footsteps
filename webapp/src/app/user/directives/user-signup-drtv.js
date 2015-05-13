angular.module('gliist')
    .directive('userSignup', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                user: '='
            },
            controller: 'SignupCtrl',

            replace: true,

            templateUrl: 'app/user/templates/user-signup-form.html'
        };
    }]);