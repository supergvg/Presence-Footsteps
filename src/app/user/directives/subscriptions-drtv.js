'use strict';

angular.module('gliist')
    .directive('subscriptions', [function () {
        return {
            restrict: 'EA',
            scope: {
                options: '=?'
            },
            controller: 'SubscriptionsCtrl',
            replace: true,
            templateUrl: 'app/user/templates/subscriptions.html'
        };
    }]);