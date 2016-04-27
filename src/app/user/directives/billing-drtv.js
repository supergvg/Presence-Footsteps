angular.module('gliist')
    .directive('billing', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
            },
            controller: 'BillingCtrl',

            replace: true,

            templateUrl: 'app/user/templates/billing.html'
        };
    }]);