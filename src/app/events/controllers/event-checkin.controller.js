'use strict';

function EventCheckinController (
  $scope,
  $state,
  $stateParams,
  $filter,
  $mdDialog,
  dialogService,
  eventsService,
  permissionsService
) {
  $scope.event = {id: 0};
  $scope.options = {
    filter: {
      active: true,
      placeholder: 'Search Guest',
      fields: ['firstName', 'lastName', 'email'],
      filterFunction: function(renderableRows, filterValue, originalFilter, fieldFilter) {
        var filterWords;
        var firstNameField = $scope.options.filter.fields[0];
        var lastNameField = $scope.options.filter.fields[1];
        var firstNameFilter;
        var lastNameFilter;
        if (filterValue.indexOf(' ') !== -1) {
          filterWords = filterValue.split(/\s+/);
          firstNameFilter = new RegExp('^' + filterWords[0], 'i');
          lastNameFilter = new RegExp('^' + filterWords[1], 'i');
          renderableRows.forEach(function(row) {
            var match = fieldFilter(row, firstNameField, firstNameFilter) &&
              fieldFilter(row, lastNameField, lastNameFilter);
            if (!match) {
              row.visible = false;
            }
          });
          return renderableRows;
        } else {
          return originalFilter(renderableRows, filterValue);
        }
      }
    },
    sorting: {
      active: true
    },
    display: {
      totalViewportItems: 7
    },
    gridOptions: {
      columnDefs: [
        {
          name: '', field: 'status', enableSorting: false, width: 50, allowCellFocus: false, cellClass: 'icon',
          cellTemplate: '<img ng-src="assets/images/icons/checked.png" ng-hide="grid.appScope.options.methods.guestPending(row.entity)"/>'
        },
        {field: 'firstName', name: 'First Name', allowCellFocus: false},
        {field: 'lastName', name: 'Last Name', allowCellFocus: false},
        {field: 'title', name: 'List Title', allowCellFocus: false, cellTooltip: function (row) {
          return row.entity.title;
        }},
        {field: 'type', name: 'Type', width: 80, allowCellFocus: false, cellTooltip: function (row) {
          return row.entity.type;
        }},
        {field: 'email', name: 'Email', allowCellFocus: false},
        {field: 'plus', name: 'Plus', width: 80, allowCellFocus: false},
        {
          name: 'Check in', field: 'id', enableSorting: false, width: 90, allowCellFocus: false, cellClass: 'actions-col',
          cellTemplate: '<div class="actions" title="Checkin">' +
          '<md-button class="icon-btn" md-no-ink="\'true\'" ng-click="grid.appScope.options.methods.checkinGuest(row.entity)" aria-label="CheckIn">' +
          '<md-icon ng-show="row.entity.status == \'checked in\'" md-svg-src="assets/images/SVG/checkWhite.svg"></md-icon>' +
          '<md-icon ng-show="grid.appScope.options.methods.guestPending(row.entity)" md-svg-src="assets/images/SVG/checklist.svg"></md-icon>' +
          '</md-button>' +
          '</div>'
        }
      ]
    },
    gridData: []
  };
  $scope.options.methods = {
    guestPending: function(row){
      return (row.status === 'no show');
    },
    checkinGuest: function(row) {
      var scope = $scope.$new();
      scope.guest = row;
      scope.close = function() {
        $mdDialog.hide();
      };
      $mdDialog.show({
        scope: scope,
        controller: 'CheckGuestCtrl',
        templateUrl: 'app/guest-lists/templates/guest-checkin.html'
      }).then(function(){
        $scope.init();
      });
    }
  };

  $scope.getExportExcelUrl = function() {
    return eventsService.getCheckinReportUrl($scope.event.id);
  };

  $scope.pastEvent = function() {
    var eventEndTime = $filter('ignoreTimeZone')($scope.event.endTime).getTime() + 24 * 60 * 60 * 1000;

    return Date.now() > eventEndTime;
  };

  $scope.isEditableGuestList = function (list) {
    return !/^(On the spot|Facebook|RSVP)$/i.test(list.listType);
  };

  $scope.init = function () {
    var eventId = $stateParams.eventId;
    $scope.options.gridData = [];
    $scope.initializing = true;
    eventsService.getGuestsForCheckin(eventId).then(function(data) {
      $scope.event = data.event;
      var guests = data.guests;
      if ($scope.pastEvent()) {
        $scope.options.gridOptions.columnDefs.pop();
      } else {
        var editableGuestLists = $scope.event.guestLists.filter($scope.isEditableGuestList);
        if (editableGuestLists.length && !permissionsService.isRole('staff') && !permissionsService.isRole('staff_limited')) {
          $scope.options.additionalButton = {
            text: 'Add guest',
            click: function () {
              var scope = $scope.$new();
              $scope.guestLists = editableGuestLists;
              $scope.guests = guests;
              $mdDialog.show({
                scope: scope,
                controller: 'AddGuestController',
                templateUrl: 'app/guest-lists/templates/guest-add-dialog.html'
              });
            }
          };
        }
      }

      $scope.options.gridData = guests;
    }, function() {
      dialogService.error('There was a problem getting your events, please try again');
      $state.go('main.current_events');
    }).finally(function() {
      $scope.initializing = false;
    });
  };

  $scope.$on('guestsAdded', function () {
    eventsService.getGuestsForCheckin($stateParams.eventId).then(function(data) {
      $scope.options.gridData = data.guests;
    });
  });

  $scope.init();
}

EventCheckinController.$inject = [
  '$scope',
  '$state',
  '$stateParams',
  '$filter',
  '$mdDialog',
  'dialogService',
  'eventsService',
  'permissionsService'
];

angular.module('gliist').controller('EventCheckinCtrl', EventCheckinController);
