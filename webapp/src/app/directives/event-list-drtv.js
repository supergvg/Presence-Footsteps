angular.module('gliist')
    .directive('eventList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                events: '='
            },
            controller: 'EventsCtrl',

            replace: true,

            templateUrl: 'app/templates/events/event-list.tmpl.html'
        };
    }]);
