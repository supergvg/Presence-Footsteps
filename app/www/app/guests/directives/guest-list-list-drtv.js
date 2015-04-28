angular.module('starter')
    .directive('guestListList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                list: '=',
                filter: '=?'
            },
            //controller: 'EventsListCtrl',

            replace: true,

            templateUrl: 'app/guests/templates/guest-list-list.html'
        };
    }]);
