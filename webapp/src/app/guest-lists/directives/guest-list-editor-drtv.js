angular.module('gliist')
    .directive('guestListEditor', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                list: '=',
                onSave: '=?'
            },
            controller: 'GuestListEditorCtrl',

            replace: true,

            templateUrl: 'app/templates/list/guest-list-grid.tmpl.html'
        };
    }]);
