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

            templateUrl: 'app/templates/user-profile/user-signup-form.html'
        };
    }]);