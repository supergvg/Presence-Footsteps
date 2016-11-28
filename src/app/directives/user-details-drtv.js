'use strict';

angular.module('gliist')
    .directive('userDetails', [function () {
        return {
            restrict: 'EA',

            scope: true,
            controller: 'UserDetailsCtrl',

            replace: true,

            templateUrl: 'app/user/templates/user-details.tmpl.html'
        };
    }]);
