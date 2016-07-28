'use strict';

angular.module('gliist')
    .directive('guestListEditor', [function () {
        return {
            restrict: 'EA',
            scope: {
                list: '=',
                onSave: '=?',
                onBeforeSave: '=?',
                linkToEvent: '=?'
            },
            controller: 'GuestListEditorCtrl',
            replace: true,
            templateUrl: 'app/guest-lists/templates/guest-list-editor.tmpl.html'
        };
    }]);
