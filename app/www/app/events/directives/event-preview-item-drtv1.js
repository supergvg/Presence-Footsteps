angular.module('starter')
    .directive('eventPreviewItem', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                event: '='
            },
            controller: 'EventPreviewController',

            replace: true,

            templateUrl: 'app/events/templates/event-preview-item.html'
        };
    }]);