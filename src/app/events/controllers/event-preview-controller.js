'use strict';

angular.module('gliist')
  .controller('EventPreviewController', ['$scope',
    function ($scope) {
      $scope.getEventInvite = function (height) {
        if (!$scope.event) {
          return;
        }
        
        return {
          'background-image': 'url(' + $scope.event.invitePicture + ')',
          'background-position': 'center center',
          'height': height || '250px',
          'background-repeat': 'no-repeat',
          'background-size': 'contain'
        };
      };

    }]);
