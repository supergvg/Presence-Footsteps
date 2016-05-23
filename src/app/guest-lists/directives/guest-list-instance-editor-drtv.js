'use strict';

angular.module('gliist')
    .directive('guestListInstanceEditor', [function() {
        return {
            restrict: 'EA',
            controller: 'GuestListInstanceEditorCtrl',
            scope: {
                id: '=',
                onSave: '=?'
            },
            replace: true,
            templateUrl: 'app/guest-lists/templates/guest-list-instance-editor.html'
        };
    }]);