'use strict';

angular.module('gliist')
    .directive('userSignup', [function () {
        return {
            restrict: 'EA',

            scope: {
                user: '=',
                options: '=?'
            },
            controller: 'SignupCtrl',

            replace: true,

            templateUrl: 'app/user/templates/user-signup-form.html'
        };
    }]);