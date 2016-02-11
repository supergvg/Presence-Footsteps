'use strict';

angular.module('gliist')
    .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'uploaderService', 'eventsService',
        function ($scope, guestFactory, dialogService, $state, uploaderService, eventsService) {

            $scope.getglistTotal = function (glist) {
                var total = 0;

                angular.forEach(glist.actual,
                    function (guest_info) {
                        total += guest_info.plus + 1;
                    });

                return total;
            };

            $scope.gridOptions = {
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name'},
                    {field: 'guest.lastName', name: 'Last Name'},
                    {field: 'guest.email', name: 'Email', enableSorting: false},
                    {field: 'guest.phoneNumber', name: 'Note', enableSorting: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false}
                ],
                enableCellEditOnFocus: true,
                rowHeight: 45,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false
            };

            $scope.gridOptions.onRegisterApi = function (gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;

                gridApi.cellNav.on.navigate($scope,function(newRowcol, oldRowCol){
                    if (newRowcol.row.entity.$$hashKey === $scope.gridOptions.data[$scope.gridOptions.data.length - 1].$$hashKey && newRowcol.col.field === 'plus') {
                        $scope.addMore();
                    }
                });

                gridApi.selection.on.rowSelectionChanged($scope, function () {
                    var selectedRows = $scope.gridApi.selection.getSelectedRows();

                    if (!selectedRows || selectedRows.length === 0) {
                        return $scope.rowSelected = false;
                    }

                    $scope.rowSelected = true;
                });
            };

            $scope.guestListTypes = [
                'GA',
                'VIP',
                'Super VIP',
                'Guest',
                'Artist',
                'Production',
                'Staff',
                'Press',
                'All Access'
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
                    function() {
                        dialogService.error('There was a problem saving your image please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

            $scope.onLinkClicked = function() {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = [];
                scope.options = {
                    enableSelection: true
                };
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

                    }, function(err) {
                        var message = err.data.Message || 'There was a problem saving your guest list, please try again';
                        dialogService.error(message);
                    }).finally(function () {
                        $scope.fetchingData = false;
                    });
            };

            $scope.$watch('id', function (newValue) {
                if (!newValue) {
                    return;
                }

                $scope.initializing = true;

                guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function (data) {
                    $scope.gli = data;
                    if ($scope.gli.instanceType === 2) {
                        $scope.gridOptions.columnDefs.splice(4);
                    }
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                );
            });

        }]);
