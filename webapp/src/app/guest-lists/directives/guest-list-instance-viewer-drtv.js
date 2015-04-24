angular.module('gliist')
    .directive('guestListInstanceView', [function () {
        'use strict';

        return {
            restrict: 'EA',

            controller: 'GuestListInstanceViewerCtrl',

            scope: {
                lists: '=?',
                options: '=?',
                selected: '=?'
            },

            replace: true,

            templateUrl: 'app/guest-lists/templates/guest-list-instance-viewer.html'
        };
    }]);