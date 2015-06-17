'use strict';

angular.module('gliist')
  .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'uploaderService', 'eventsService',
    function ($scope, guestFactory, dialogService, $state, uploaderService, eventsService) {


      function mergeGuestList(parent, merge) {
        parent.guests = parent.guests.concat(merge.guests); //TODO need to ignore merges
      }


      $scope.getglistTotal = function (glist) {
        var total = 0;

        angular.forEach(glist.actual,
          function (guest_info) {
            total += guest_info.plus + 1;
          });

        return total;
      };

      $scope.getRowStyle = function (checkin) {
        return {
          'background-color': 'white',
          'border-bottom': 'thin inset #ECECEC'
        }
      };

      $scope.gridOptions = {
        rowTemplate: '<div' +
        '  <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
        'ng-style="grid.appScope.getRowStyle(row.entity)" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ' +
        ' ui-grid-cell></div>' +
        '</div>',
        columnDefs: [
          {field: 'guest.firstName', name: 'First Name', enableHiding: false},
          {field: 'guest.lastName', name: 'Last Name', enableHiding: false},
          {field: 'guest.email', name: 'Email', enableHiding: false, enableSorting: false},
          {field: 'guest.phoneNumber', name: 'Phone Number', enableHiding: false, enableSorting: false},
          {field: 'guest.plus', name: 'Plus', enableHiding: false, enableSorting: false}
        ],
        rowHeight: 35
      };

      $scope.gridOptions.onRegisterApi = function (gridApi) {
        //set gridApi on scope
        $scope.gridApi = gridApi;

        gridApi.selection.on.rowSelectionChanged($scope, function () {
          var selectedRows = $scope.gridApi.selection.getSelectedRows();

          if (!selectedRows || selectedRows.length === 0) {
            return $scope.rowSelected = false;
          }

          $scope.rowSelected = true;
        });
      }

      $scope.guestListTypes = [
        'GA',
        'VIP',
        'Guest',
        'Artist',
        'Production',
        'Staff',
        'Press'

      ];

      $scope.selected = $scope.selected || [];

      $scope.deleteSelectedRows = function () {

        var selectedRows = $scope.gridApi.selection.getSelectedRows();

        if (!selectedRows || selectedRows.length === 0) {
          return;
        }

        var guestsIds = _.map(selectedRows, function (row) {
          return row.guest.id;
        });

        $scope.isDirty = true;

        $scope.fetchingData = true;

        eventsService.removeGuestsFromGLInstance($scope.gli.id, guestsIds).then(
          function (gli) {
            $scope.gli = gli;
          }
        ).finally(function () {
            $scope.fetchingData = false;
          });

        $scope.rowSelected = false;
      };

      $scope.$watchCollection('gli', function (newVal, oldValue) {
        if (!newVal) {
          return;
        }

        if (!angular.equals(newVal, oldValue)) {
          $scope.isDirty = true;
        }
        $scope.gridOptions.data = $scope.gli.actual;
      });

      $scope.onFileSelect = function (files) {
        if (!files || files.length === 0) {
          return;
        }
        $scope.upload(files[0]);
      };

      $scope.upload = function (files) {
        $scope.fetchingData = true;
        uploaderService.uploadGuestList(files).then(function (data) {
            _.extend($scope.gli, data.data);
          },
          function (err) {
            dialogService.error('There was a problem saving your image please try again');
          }
        ).finally(
          function () {
            $scope.fetchingData = false;
          }
        )
      };

      $scope.onLinkClicked = function (ev) {
        var scope = $scope.$new();
        scope.currentGlist = $scope.event;
        scope.cancel = $scope.cancel;
        scope.save = $scope.save;
        scope.selected = [];
        scope.options = {
          enableSelection: true
        };

        scope.cancel = function () {
          $mdDialog.hide();
        };


        $mdDialog.show({
          //controller: DialogController,
          scope: scope,
          templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
          targetEvent: ev
        });
      };

      $scope.addMore = function () {
        if (!$scope.gli) {
          $scope.gli = {};
        }

        if (!$scope.gli.actual) {
          $scope.gli.actual = [];
        }

        $scope.gli.actual.push({
          gl_id: $scope.gli.id,
          status: 'no show',
          guest: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            plus: 0
          }
        });
      };

      $scope.save = function () {
        $scope.fetchingData = true;

        if (!$scope.gli.listType) {
          $scope.gli.listType = 'GA';
        }
        guestFactory.GuestListInstance.update($scope.gli).$promise.then(
          function (res) {
            _.extend($scope.gli, res);
            dialogService.success('Guest list saved');
            $scope.isDirty = false;

            if ($scope.onSave) {
              $scope.onSave(res);
            }

          }, function () {
            dialogService.error('There was a problem saving your guest list, please try again');
          }).finally(function () {
            $scope.fetchingData = false;
          })
      };

      $scope.$watch('id', function (newValue) {
        if (!newValue) {
          return;
        }

        $scope.initializing = true;

        guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function (data) {
          $scope.gli = data;
        }, function () {
          dialogService.error('There was a problem getting your events, please try again');
          $state.go('main.current_events');
        }).finally(
          function () {
            $scope.initializing = false;
          }
        )
      });

    }]);
