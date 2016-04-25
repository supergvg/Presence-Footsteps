'use strict';

angular.module('gliist')
    .directive('guestListView', [function () {
        return {
            restrict: 'EA',

            controller: 'GuestListViewerCtrl',

            scope: {
                lists: '=?',
                options: '=?',
                selected: '=?'
            },

            replace: true,

            templateUrl: 'app/guest-lists/templates/guest-list-viewer.html'
        };
    }]);