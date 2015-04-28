angular.module('starter')
    .directive('eventsList', [function () {
        'use strict';

        return {
            restrict: 'EA',

            scope: {
                events: '='
            },
            controller: 'EventsListController',

            replace: true,

            templateUrl: 'app/events/templates/events-list.html'
        };
    }]);
