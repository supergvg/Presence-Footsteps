angular.module('gliist')
    .directive('eventPublish', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                eventId: '=',
                options: '=?'
            },
            controller: 'EventPublishCtrl',

            replace: true,

            templateUrl: 'app/events/templates/event-publish.html'
        };
    }]);
