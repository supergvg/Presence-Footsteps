'use strict';

angular.module('gliist')
  .controller('AddGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService',
    function ($scope, $stateParams, dialogService, $state, eventsService) {
      var eventId = $stateParams.eventId;
      var eventType = 1;

      if (eventId) {
        eventsService
          .getEvents(eventId)
          .then(
            function(data) {
              eventType = data.type;
            }, function () {
              dialogService.error('There was a problem getting your event, please try again');
            }
          );
      }

      $scope.goBackToEvent = function (glist, autoSave) {
        if (!autoSave) {
          $state.go('main.edit_event', {
            eventId: eventId,
            view: eventType === 1 ? 3 : 4
          });
        }
      };

      $scope.linkToEvent = function (glist) {
        var p = eventsService.linkGuestList([glist], eventId, $stateParams.instanceType);

        p.then(
          function() {
            dialogService.success('Guest lists were linked');
          }, function () {
            dialogService.error('There was a problem linking, please try again');
          }
        );

        return p;
      };

      $scope.init = function () {
        $scope.currentGlist = {
          title: 'New Guest List',
          guests: []
        };
      };

      $scope.init();
    }]);
