'use strict';

angular.module('gliist')
    .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'eventsService', '$interval',
        function ($scope, guestFactory, dialogService, $state, eventsService, $interval) {

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
            $scope.gridOptions = {
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell ng-keydown="grid.appScope.gridCellTab($event, col)"></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name'},
                    {field: 'guest.lastName', name: 'Last Name'},
                    {field: 'guest.email', name: 'Email', enableSorting: false},
                    {field: 'guest.notes', name: 'Note', enableSorting: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false}
                ],
                enableCellEditOnFocus: true,
                rowHeight: 45,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false
            };
            $scope.rowSelected = false;
            $scope.isDirty = false;
            
            $scope.gridCellTab = function(event, col) {
                if (event.keyCode === 9 && col.uid === col.grid.columns[col.grid.columns.length - 1].uid) {
                    $scope.addMore();
                }
            };
            
            $scope.gridOptions.onRegisterApi = function(gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;
                
                var rowSelectionChanged = function() {
                    $scope.rowSelected = $scope.gridApi.selection.getSelectedRows();
                    if ($scope.rowSelected.length === 0) {
                        $scope.rowSelected = false;
                    }
                };

                gridApi.selection.on.rowSelectionChanged($scope, rowSelectionChanged);
                gridApi.selection.on.rowSelectionChangedBatch($scope, rowSelectionChanged);
                
                gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                    if (newValue !== oldValue) {
                        $scope.isDirty = true;
                    }
                });
            };
            
            $scope.$watch('id', function(newValue) {
                if (!newValue) {
                    return;
                }
                $scope.initializing = true;
                guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function(data) {
                    $scope.gli = data;
                    if ($scope.gli.instanceType === 2) {
                        $scope.gridOptions.columnDefs.splice(4);
                    }
                }, function() {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(
                    function() {
                        $scope.initializing = false;
                    }
                );
            });
            
            $scope.$watch('isDirty', function(newValue) {
                if (newValue === true) {
                    $scope.startAutoSave();
                }
            });
            
            $scope.$watchCollection('gli', function(newVal) {
                if (!newVal) {
                    return;
                }
                $scope.gridOptions.data = $scope.gli.actual;
            });
            
            $scope.startAutoSave = function() {
                $scope.autoSave = $interval(function(){
                    if (!$scope.guestsError() && !$scope.fetchingData) {
                        $scope.save(true);
                    }
                }, 20000);
            };
            $scope.cancelAutoSave = function() {
                $scope.isDirty = false;
                if ($scope.autoSave) {
                    $interval.cancel($scope.autoSave);
                    delete $scope.autoSave;
                }
            };
            
            $scope.addMore = function() {
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
                        notes: '',
                        plus: 0
                    }
                });
                $scope.isDirty = true;
            };

            $scope.deleteSelectedRows = function() {
                if (!$scope.rowSelected) {
                    return;
                }
                $scope.fetchingData = true;
                $scope.cancelAutoSave();
                var guestIds = [];
                angular.forEach($scope.rowSelected, function(row){
                    guestIds.push(row.guest.id);
                });
                eventsService.removeGuestsFromGLInstance($scope.gli.id, guestIds).then(
                    function(gli) {
                        $scope.gli = gli;
                    }
                ).finally(function () {
                    $scope.fetchingData = false;
                });
                $scope.rowSelected = false;
            };
            
            $scope.save = function(autoSave) {
                if ($scope.guestsError()) {
                    dialogService.error('First Name must be not empty.');
                    return;
                }
                $scope.fetchingData = true;
                $scope.cancelAutoSave();
                if (!$scope.gli.listType) {
                    $scope.gli.listType = 'GA';
                }
                guestFactory.GuestListInstance.update($scope.gli).$promise.then(
                    function(data) {
                        if (!autoSave) {
                            $scope.gli = data;
                        }
                        var message = 'Guest list saved';
                        if (autoSave) {
                            message = 'Guest list autosaved';
                        }
                        dialogService.success(message);
                        if ($scope.onSave && !autoSave) {
                            $scope.onSave(data);
                        }
                    }, function(error) {
                        var message = error.data.Message || 'There was a problem saving your guest list, please try again';
                        dialogService.error(message);
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
            
            $scope.guestsError = function() {
                var result = false;
                if (!$scope.gli) {
                    return result;
                }
                angular.forEach($scope.gli.actual, function(actual) {
                    result = result || (actual.guest.firstName === '');
                });
                return result;
            };
        }]
    );