angular.module('starter')
    .directive('guestListInstanceList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                event: '='
            },

            controller: 'guestListInstanceListController',

            replace: true,

            templateUrl: 'app/guests/templates/guest-list-instance-list.html'
        };
    }]);
