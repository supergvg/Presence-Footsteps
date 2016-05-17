'use strict';

angular.module('gliist')
    .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'eventsService', '$interval', '$mdMedia',
        function ($scope, guestFactory, dialogService, $state, eventsService, $interval, $mdMedia) {

            $scope.options = $scope.options || {sorting: true};
            $scope.sort = {
                sortingFields: [],
                sortField: ''
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
            $scope.defaultFields = {
                firstName: '',
                lastName: '',
                email: '',
                notes: '',
                plus: 0
            };
            $scope.rowSelected = false;
            $scope.isDirty = false;
            
            $scope.$watch(function() { return !$mdMedia('gt-sm'); }, function(status) {
                $scope.isMobile = status;
                var numberFields = $scope.gridOptions.columnDefs.length;
                $scope.gridOptions.rowHeight = $scope.isMobile ? 40 * numberFields + 22 : 45; // 40 - height field, 22 - row margin + border
                if ($scope.list) {
                    var data = [];
                    angular.copy($scope.gridOptions.data, data);
                    angular.copy(data, $scope.gli.actual);
                }
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
            
            $scope.gridOptions = {
                rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.name === \'\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                columnDefs: [
                    {field: 'guest.firstName', name: 'First Name'},
                    {field: 'guest.lastName', name: 'Last Name'},
                    {field: 'guest.email', name: 'Email'},
                    {field: 'guest.notes', name: 'Note', enableSorting: false},
                    {field: 'guest.plus', name: 'Plus', enableSorting: false}
                ],
                enableCellEditOnFocus: true,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false,
                data: []
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
                }).finally(function() {
                    $scope.initializing = false;
                });
            });
            
            if ($scope.options.sorting !== undefined) {
                $scope.gridOptions.enableSorting = $scope.options.sorting;
            }
            
            angular.forEach($scope.gridOptions.columnDefs, function(value){
                if (value.enableSorting === undefined || value.enableSorting) {
                    $scope.sort.sortingFields.push(value);
                }
            });
            
            $scope.setSortField = function() {
                var column = $scope.gridApi.grid.getColumn($scope.sort.sortField);
                $scope.gridApi.grid.sortColumn(column);
                $scope.gridApi.grid.refresh();
            };

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
            
            $scope.getTableHeight = function() {
                var numberItems = $scope.isMobile ? 2 : 7;
                if ($scope.options.verticalScroll === false) {
                    numberItems = $scope.gridOptions.data.length;
                }
                if (!$scope.isMobile) {
                    numberItems++;
                }
                return {
                    height: (numberItems * $scope.gridOptions.rowHeight + 5) + 'px'
                };
            };
            
            $scope.getClass = function() {
                var classes = ['margin-top'];
                if ($scope.options.verticalScroll === false) {
                    classes.push('no-vertical-scroll');
                }
                return classes;
            };
            
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
                    guest: angular.extend({}, $scope.defaultFields)
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
                var gli = {};
                angular.copy($scope.gli, gli);
                if (autoSave) {
                    gli.actual.splice(gli.actual.length - 1, 1);
                }
                guestFactory.GuestListInstance.update(gli).$promise.then(
                    function(data) {
                        if (!autoSave) {
                            $scope.gli = data;
                        } else {
                            $scope.gli.id = data.id;
                            var savedGuestsId = [],
                                newSavedGuests = [];
                            angular.forEach($scope.gli.actual, function(guest) {
                                if (guest.guest.id) {
                                    savedGuestsId.push(guest.guest.id);
                                }
                            });
                            angular.forEach(data.actual, function(guest) {
                                if (savedGuestsId.indexOf(guest.guest.id) === -1) {
                                    newSavedGuests.push(guest);
                                }
                            });
                            angular.forEach($scope.gli.actual, function(guest, key) {
                                if (!guest.guest.id) {
                                    angular.forEach(newSavedGuests, function(newGuest, newKey){
                                        if (guest.guest.firstName === newGuest.guest.firstName && guest.guest.lastName === newGuest.guest.lastName && guest.guest.email === newGuest.guest.email) {
                                            $scope.gli.actual[key].id = newGuest.id;
                                            $scope.gli.actual[key].guest.id = newGuest.guest.id;
                                            delete newSavedGuests[newKey];
                                            return;
                                        }
                                    });
                                }
                            });
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