'use strict';

angular.module('gliist')
  .controller('GuestListViewerCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$rootScope', '$filter', 'permissionsService',
    function ($scope, guestFactory, dialogService, $mdDialog, $rootScope, $filter, permissionsService) {
      $scope.selected = $scope.selected || [];
      $scope.options = $scope.options || {};
      var defaultOptions = {
        filter: {
          active: true,
          placeholder: 'Search Guest List or Creator',
          fields: ['title', 'created_by']
        }
      };
      angular.forEach(defaultOptions, function(value, key){
        $scope.options[key] = angular.merge(value, $scope.options[key]);
      });
      $scope.options.gridOptions = {
        columnDefs: [
          {field: 'title', name: 'Guest List', minWidth: 200, allowCellFocus: false, cellTooltip: function (row) {
            return row.entity.title;
          }},
          {field: 'total', name: 'Total', maxWidth: 100, allowCellFocus: false},
          {field: 'listType', name: 'Category', maxWidth: 150, allowCellFocus: false},
          {field: 'created_on', name: 'Date', maxWidth: 150, allowCellFocus: false},
          {field: 'UpdatedOn', name: 'Update', maxWidth: 150, allowCellFocus: false},
          {field: 'created_by', name: 'Updated By', enableSorting: false, maxWidth: 150, allowCellFocus: false}
        ]
      };
      if (!permissionsService.isRole('staff')) {
        $scope.options.gridOptions.columnDefs.push({
          name: '', field: 'id', enableSorting: false, width: 140, cellClass: 'actions-col', allowCellFocus: false,
          cellTemplate: '<div class="actions">' +
          '     <md-button class="icon-btn" ui-sref="main.edit_glist({listId:row.entity.id})" ng-hide="grid.appScope.options.display.readOnly" aria-label="Edit guest list">' +
          '         <md-tooltip md-direction="top">edit guest list</md-tooltip>' +
          '         <ng-md-icon icon="mode_edit"></ng-md-icon>' +
          '     </md-button>' +
          '     <md-button class="icon-btn" ng-click="grid.appScope.options.methods.deleteGuest($event, row.entity.glist)" ng-hide="!grid.appScope.options.methods.isRemoval(row.entity.glist)" aria-label="Delete guest list">' +
          '         <md-tooltip md-direction="top">delete guest list</md-tooltip>' +
          '         <ng-md-icon icon="delete"></ng-md-icon>' +
          '     </md-button>' +
          '     <md-checkbox ng-checked="grid.appScope.options.methods.guestSelected(row.entity.glist)" ng-click="grid.appScope.options.methods.toggleSelected(row.entity.glist)" aria-label="Import" ng-show="grid.appScope.options.display.enableSelection"></md-checkbox>' +
          '</div>'
        });
      }

      $scope.options.methods = {
        isRemoval: function(guest) {
          if ($scope.options.display.readOnly) {
            return false;
          }
          if (!permissionsService.isRole('promoter') || !guest.created_by) {
            return true;
          }
          return guest.created_by.UserName === $rootScope.currentUser.UserName;
        },
        guestSelected: function(guest) {
          return $scope.selected.indexOf(guest) > -1;
        },
        toggleSelected: function(guest) {
          var idx = $scope.selected.indexOf(guest);
          if (idx > -1) {
            $scope.selected.splice(idx, 1);
          } else {
            $scope.selected.push(guest);
          }
        },
        deleteGuest: function(ev, guest) {
          // Appending dialog to document.body to cover sidenav in docs app
          var confirm = $mdDialog.confirm()
          //.parent(angular.element(document.body))
            .title('Are you sure you want to delete guest list?')
            //.content('Confirm ')
            .ariaLabel('Lucky day')
            .ok('Yes')
            .cancel('No')
            .targetEvent(ev);
          $mdDialog.show(confirm).then(function() {
            guestFactory.GuestList.delete({id: guest.id}).$promise.then(function () {
              $scope.getGuestLists();
            }, function () {
              dialogService.error('There was a problem please try again');
            });
          }, function() {
            $scope.alert = 'You decided to keep your debt.';
          });
        }
      };

      $scope.getGuestLists = function () {
        $scope.fetchingData = true;
        guestFactory.GuestLists.get().$promise.then(
          function(data) {
            if ($scope.rsvpOnly) {
              $scope.guestLists =data.filter(function (list) {
                return list.listType === 'RSVP';
              });
            } else {
              $scope.guestLists = data;
            }
            $scope.options.gridData.splice(0, $scope.options.gridData.length);
            angular.forEach($scope.guestLists, function(guestList) {
              if ($scope.skipOnTheSpot && guestList.listType === 'On the spot') {
                return;
              }

              $scope.options.gridData.push({
                id: guestList.id,
                title: guestList.title,
                total: guestList.total,
                listType: guestList.listType,
                created_on: $filter('date')(guestList.created_on, 'MMM dd, yy'),
                UpdatedOn: $filter('date')(guestList.UpdatedOn, 'MMM dd, yy'),
                created_by: guestList.created_by ? guestList.created_by.firstName +' '+ guestList.created_by.lastName : '',
                glist: guestList
              });
            });
          },
          function() {
            dialogService.error('There was a problem getting lists, please try again');
          }
        ).finally(function() {
          $scope.fetchingData = false;
        });
      };
    }]);
