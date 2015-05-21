'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService', 'eventsService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService, eventsService) {

            $scope.getRowStyle = function (checkin) {
                return{
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
                    { field: 'firstName', name: 'First Name', enableHiding: false},
                    { field: 'lastName', name: 'Last Name', enableHiding: false},
                    { field: 'email', name: 'Email', enableHiding: false, enableSorting: false},
                    { field: 'phoneNumber', name: 'Phone Number', enableHiding: false, enableSorting: false},
                    { field: 'plus', name: 'Plus', enableHiding: false, enableSorting: false}
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
                    return row.id;
                });

                $scope.isDirty = true;

                $scope.fetchingData = true;

                eventsService.removeGuestsFromGLInstance($scope.list.id, guestsIds).then(
                    function () {
                        $scope.list.guests = _.reject($scope.list.guests, function (row) {
                            return _.find(selectedRows, function (sr) {
                                return sr.id === row.id;
                            });
                        });
                    }
                ).finally(function () {
                        $scope.fetchingData = false;
                    });


                $scope.rowSelected = false;

            };

            $scope.$watchCollection('list', function (newVal, oldValue) {
                if (!newVal) {
                    return;
                }

                if (!angular.equals(newVal, oldValue)) {
                    $scope.isDirty = true;
                }
                $scope.gridOptions.data = $scope.list.guests;
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

                        if (!$scope.list) {
                            $scope.list = {};
                        }
                        else {
                            if ($scope.list.title) {
                                delete data.title;
                            }
                        }

                        _.extend($scope.list, data);
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
                }

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
                if (!$scope.list) {
                    $scope.list = {};
                }

                if (!$scope.list.guests) {
                    $scope.list.guests = [];
                }

                $scope.list.guests.push({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    plus: 0
                });
            };

            $scope.save = function () {
                $scope.fetchingData = true;

                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }
                guestFactory.GuestList.update($scope.list).$promise.then(
                    function (res) {
                        _.extend($scope.list, res);
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

            $scope.init = function () {

                if (!$scope.options) {
                    $scope.options = {};
                }

            };

            $scope.init();

        }]);
