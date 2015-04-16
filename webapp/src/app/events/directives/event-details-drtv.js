angular.module('gliist')
    .directive('eventDetails', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                event: '='
            },
            controller: 'EventDetailsController',

            replace: true,

            templateUrl: 'app/templates/events/event-details.tmpl.html'
        };
    }]);
