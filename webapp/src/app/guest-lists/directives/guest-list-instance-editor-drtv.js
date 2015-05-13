angular.module('gliist')
    .directive('guestListInstanceEditor', [function () {
        'use strict';

        return {
            restrict: 'EA',

            controller: 'GuestListInstanceEditorCtrl',

            scope: {
                id: '='
            },

            replace: true,

            templateUrl: 'app/guest-lists/templates/guest-list-instance-editor.html'
        };
    }]);