angular.module('gliist')
    .directive('accountDetails', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                user: '='
            },
            controller: 'AccountDetailsCtrl',

            replace: true,

            templateUrl: 'app/user/templates/account-details.html'
        };
    }]);