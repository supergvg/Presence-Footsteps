'use strict';

function EventsController ($scope) {
  $scope.$on('facebookEventImport', function (e, event) {
    $scope.currentEvent = {
      title: event.title
    };
  });
}


angular.module('gliist').controller('EventsCtrl', EventsController);
