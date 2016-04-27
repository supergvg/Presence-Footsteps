'use strict';

angular.module('gliist')
    .directive('guestListInstanceView', [function () {
        return {
            restrict: 'EA',

            controller: 'GuestListInstanceViewerCtrl',

            scope: {
                event: '=?',
                lists: '=?',
                options: '=?',
                selected: '=?',
                published: '=?'
            },

            replace: true,

            templateUrl: 'app/guest-lists/templates/guest-list-instance-viewer.html'
        };
    }]);