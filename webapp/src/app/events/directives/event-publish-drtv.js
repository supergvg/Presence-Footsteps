'use strict';

angular.module('gliist')
    .directive('eventPublish', [function () {
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
