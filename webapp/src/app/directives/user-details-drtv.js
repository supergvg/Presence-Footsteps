angular.module('gliist')
    .directive('userDetails', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                user: '='
            },
            controller: 'UserDetailsCtrl',

            replace: true,

            templateUrl: 'app/user/templates/user-details.tmpl.html'
        };
    }]);