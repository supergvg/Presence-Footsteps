'use strict';

angular.module('gliist')
  .controller('EmailStatsController', ['$scope', 'eventsService', 'dialogService', '$state', '$stateParams', '$location', '$rootScope',
    function ($scope, eventsService, dialogService, $state, $stateParams, $location, $rootScope) {
      $scope.selectedIndex = parseInt($location.search().view) || 0;
      $scope.selected = [];
      $scope.options = $scope.options || {};
      $scope.options = {
        filter: {
          active: true,
          placeholder: 'Search Guest',
          fields: ['name', 'status', 'email']
        },
        sorting: {
          active: true
        },
        display: {
          totalMobileViewportItems: 2,
          totalViewportItems: 6
        },
        gridOptions: {
          columnDefs: [
            {field: 'status', name: 'Status', cellTemplate: '<div class="ui-grid-cell-contents status-{{row.entity.deliveryStatus}}" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
            {field: 'name', name: 'Name'},
            {field: 'email', name: 'Email', cellTemplate: '<div class="ui-grid-cell-contents" ng-class="row.entity.isEdited ? \'edited\' : \'\'" title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'},
            {
              field: 'id', name: 'Select', enableSorting: false, allowCellFocus: false, maxWidth: 80, cellClass: 'actions-col',
              cellTemplate: '<div class="actions"><md-checkbox ng-checked="grid.appScope.options.methods.isGuestSelected(row.entity)" ng-click="grid.appScope.options.methods.toggleGuestSelected(row.entity)" aria-label="Select"></md-checkbox></div>'
            }
          ]
        },
        gridData: []
      };

      $scope.options.methods = {
        isGuestSelected: function(item) {
          return $scope.selected.indexOf(item) > -1;
        },
        toggleGuestSelected: function(item) {
          var idx = $scope.selected.indexOf(item);
          if (idx > -1) {
            $scope.selected.splice(idx, 1);
          } else {
            $scope.selected.push(item);
          }
        }
      };

      $scope.getSelected = function(idx) {
        return ($scope.selectedIndex === idx ? 'active' : '');
      };

      $scope.$watch('selectedIndex', function(newValue) {
        $location.search('view', newValue);
      });

      $scope.resend = function() {
        if ($scope.selected.length > 0) {
          $scope.sendingData = true;
          var data = {
            EventId: $scope.event.id,
            EmailRequests: []
          };
          angular.forEach($scope.selected, function(item){
            data.EmailRequests.push({
              GuestId: item.id,
              MessageType: item.messageType
            });
          });
          eventsService.resendGuestEmails(data).then(function() {
            angular.forEach($scope.selected, function(item){
              var index = $scope.options.gridData.indexOf(item);
              if (index > -1) {
                $scope.options.gridData[index].status = $scope.getTextStatus(0);
                $scope.options.gridData[index].deliveryStatus = 0;
              }
            });
            $scope.selected = [];
          }, function() {
            dialogService.error('There was a problem resending guest emails, please try again');
          }).finally(function() {
            $scope.sendingData = false;
          });
        }
      };

      $scope.getTextStatus = function(status) {
        if (status === 0) {
          return 'Sending';
        } else if (status === 1) {
          return 'Delivered';
        } else if (status === 2) {
          return 'Not Delivered';
        } else if (status === 3) {
          return 'Not Delivered';
        }
        return '';
      };
      //EmailDeliveryStatus Sending = 0 Delivered = 1 DeliveryFailed = 2

      $scope.init = function() {
        $rootScope.appStatus(false);
        var eventId = $stateParams.eventId;
        $scope.initializing = true;

        eventsService.getEvents(eventId).then(function(data) {
          $scope.event = data;
          $scope.eventInPast = new Date($scope.event.endTime) <= new Date($scope.event.time);

        }, function() {
          dialogService.error('There was a problem getting your events, please try again');
          $state.go('main.current_events');
        }).finally(function() {
          $scope.initializing = false;
          $rootScope.appStatus(true);
        });

        $scope.fetchingData = true;
        eventsService.getEmailDeliveryReport(eventId).then(function(data) {
          $scope.deliveryReport = data.DeliveryReports;
          angular.forEach($scope.deliveryReport, function(guest) {
            $scope.options.gridData.push({
              id: guest.GuestId,
              name: (guest.FirstName ? guest.FirstName : '') + (guest.LastName ? (' ' + guest.LastName) : ''),
              email: guest.Email,
              status: $scope.getTextStatus(guest.DeliveryStatus),
              messageType: guest.MessageType,
              deliveryStatus: guest.DeliveryStatus,
              isEdited: guest.Edited
            });
          });
        }, function() {
          dialogService.error('There was a problem getting delivery report, please try again');
        }).finally(function() {
          $scope.fetchingData = false;
        });
      };
    }
  ]);
