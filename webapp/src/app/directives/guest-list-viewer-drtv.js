angular.module('gliist')
    .directive('guestListView', [function () {
        'use strict';

        return {
            restrict: 'EA',

            controller: 'GuestListCtrl',

            scope: {
                options: '=?',
                selected: '=?'
            },

            replace: true,

            templateUrl: 'app/templates/list/guest-list-viewer.html'
        };
    }]);