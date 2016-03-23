angular.module('gliist')
    .directive('guestListMange', [function () {
        'use strict';

        return {
            restrict: 'EA',

            controller: 'GuestListCtrl',

            scope: {
                list: '=?',
                options: '=?'
            },

            replace: true,

            templateUrl: 'app/guest-lists/templates/guest-list-management.html'
        };
    }]);