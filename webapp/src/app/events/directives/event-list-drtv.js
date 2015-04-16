angular.module('gliist')
    .directive('eventList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                events: '='
            },
            controller: 'EventsListCtrl',

            replace: true,

            templateUrl: 'app/events/templates/event-list.tmpl.html'
        };
    }]);
