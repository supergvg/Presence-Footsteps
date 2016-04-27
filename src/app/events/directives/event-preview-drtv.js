angular.module('gliist')
  .directive('eventPreview', [function () {
    'use strict';

    return {
      restrict: 'EA',

      scope: {
        event: '='
      },
      controller: 'EventPreviewController',

      replace: true,

      templateUrl: 'app/events/templates/event-preview.html'
    };
  }]);
