angular.module('gliist')
    .directive('guestListGrid', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                list: '='
            },
            controller: 'GuestListCtrl',

            replace: true,

            templateUrl: 'app/templates/events/guest-list-grid.tmpl.html'
        };
    }]);
