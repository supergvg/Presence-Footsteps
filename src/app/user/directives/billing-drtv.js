'use strict';

angular.module('gliist')
    .directive('billing', [function () {
        return {
            restrict: 'EA',

            scope: {
            },
            controller: 'BillingCtrl',

            replace: true,

            templateUrl: 'app/user/templates/billing.html'
        };
    }]);