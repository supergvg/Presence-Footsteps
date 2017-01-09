'use strict';

angular.module('gliist')
  .controller('AddEditGLEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', 'subscriptionsService',
    function ($scope, $stateParams, dialogService, $state, eventsService, subscriptionsService) {
      $scope.gliId = $stateParams.id;
      $scope.listIsLinked = false;
      $scope.currentGlist = {
        title: 'New Guest List',
        guests: []
      };

      var eventId = $stateParams.eventId;
      var eventTotalGuests = 0;
      var eventType = 1;


      if (eventId) {
        eventsService
          .getEvents(eventId)
          .then(
            function(data) {
              eventType = data.type;
              $scope.createTitle = data.type === 2 ? 'Create Mailing List' : 'Create Guest List';
              eventTotalGuests = $scope.getTotalGuests(data.guestLists);
            }, function () {
              dialogService.error('There was a problem getting your event, please try again');
            }
          );
      }

      $scope.getTotalGuests = function(guestLists) {
        var total = 0;

        angular.forEach(guestLists, function(gl){
          if ((!$scope.gliId || ($scope.gliId && Number(gl.id) !== Number($scope.gliId))) && angular.isDefined(gl.guestsCount)) {
            total += gl.guestsCount;
          }
        });

        return total;
      };

      $scope.checkSubscription = function(glist, showPopup) {
        if (!glist.guests && !glist.actual) {
          return true;
        }

        var guests = glist.guests || glist.actual;
        var guestsInCurrentList = 0;

        for (var i = 0, c = guests.length; i< c; i++) {
          guestsInCurrentList++;
          guestsInCurrentList += Number(guests[i].guest.plus);
        }

        if (!subscriptionsService.verifyFeature('Guests', eventTotalGuests + guestsInCurrentList, showPopup, eventId)) {
          return false;
        }

        return true;
      };

      $scope.goBackToEvent = function(glist, autosave) {
        if (!autosave) {
          $state.go('main.edit_event', {
            eventId: eventId,
            view: eventType === 1 ? 3 : 4
          });
        }
      };
    }]);
