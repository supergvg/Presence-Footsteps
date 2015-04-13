angular.module('gliist')
    .directive('guestListMange', [function () {
        'use strict';

        return {
            restrict: 'EA',

            controller: 'GuestListCtrl',

            scope: {
                list: '='
            },

            replace: true,

            templateUrl: 'app/templates/list/guest-list-management.html'
        };
    }]);