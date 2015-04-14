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

            templateUrl: 'app/templates/list/guest-list-grid.tmpl.html'
        };
    }]);
