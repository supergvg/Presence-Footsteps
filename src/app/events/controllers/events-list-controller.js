'use strict';

angular.module('gliist')
  .controller('EventsListCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$state', 'permissionsService',
    function ($scope, $mdDialog, eventsService, dialogService, $state, permissionsService) {
      $scope.options = $scope.options || {};
      var defaultOptions = {
        showInactive: false,
        filter: {
          active: false
        }
      };
      angular.forEach(defaultOptions, function(value, key){
        if (angular.isObject(value)) {
          $scope.options[key] = angular.merge(value, $scope.options[key]);
        } else if (angular.isUndefined($scope.options[key])) {
          $scope.options[key] = value;
        }
      });
      $scope.orderField = $scope.options.stats ? '-time' : '';
      $scope.filter = {
        value: ''
      };

      $scope.getEventInvite = function(event) {
        return {
          'background-image': 'url("' + event.invitePicture + '")',
          'background-position': 'center center',
          'min-width': '200px',
          'height': '185px',
          'background-size': 'cover'
        };
      };

      $scope.showUpgradePopup = function(event) {
        if (permissionsService.isRole('admin')) {
          dialogService.confirm(event, 'Do you want to activate this event?', 'Yes', '', 'close-x border').then(
            function() {
              $state.go('main.user', {view: 2});
            }
          );
        }
      };

      $scope.deleteEvent = function(ev, event) {
        // Appending dialog to document.body to cover sidenav in docs app
        var confirm = $mdDialog.confirm()
        //.parent(angular.element(document.body))
          .title('Are you sure you want to delete event?')
          //.content('Confirm ')
          .ariaLabel('Lucky day')
          .ok('Yes')
          .cancel('No')
          .targetEvent(ev);
        $mdDialog.show(confirm).then(function() {
          eventsService.deleteEvent(event.id).then(function() {
            $scope.refreshEvents();
          }, function() {
            dialogService.error('There was a problem please try again');
          });
        }, function() {
          $scope.alert = 'You decided to keep your debt.';
        });
      };

      $scope.refreshEvents = function () {
        if ($scope.options && $scope.options.local) {
          return;
        }
        $scope.fetchingData = true;
        var promise;
        if ($scope.options && $scope.options.past) {
          promise = eventsService.getPastEvents();
        } else {
          promise = eventsService.getCurrentEvents();
        }
        promise.then(function(data) {
          $scope.events = data;
        }, function () {
          //dialogService.error('There was a problem getting your events, please try again');
        }).finally(function() {
          $scope.fetchingData = false;
        });
      };

      $scope.init = function () {
        $scope.refreshEvents();
      };

      $scope.init();
    }
  ]);
