'use strict';

angular.module('gliist')
    .directive('eventDetails', [function () {
        return {
            restrict: 'EA',

            scope: {
                event: '='
            },
            controller: 'EventDetailsController',

            replace: true,

            templateUrl: 'app/events/templates/event-details.tmpl.html'
        };
    }]);
