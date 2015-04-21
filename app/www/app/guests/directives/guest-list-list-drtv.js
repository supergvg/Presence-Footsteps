angular.module('starter')
    .directive('guestListList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                list: '='
            },
            //controller: 'EventsListCtrl',

            replace: true,

            templateUrl: 'app/guests/templates/guest-list-list.html'
        };
    }]);
