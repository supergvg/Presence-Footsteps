'use strict';

angular.module('gliist')
    .directive('guestListMange', [function () {
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