'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', 'uploaderService', 'eventsService', '$state', '$stateParams', 'userService', '$interval', '$mdMedia',
        function ($scope, guestFactory, dialogService, $mdDialog, uploaderService, eventsService, $state, $stateParams, userService, $interval, $mdMedia) {

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
                'Comp',
                'Press',
                'All Access',
                'Reduced'
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
                    angular.copy(data, $scope.list.guests);
                }
            });

            $scope.$watch('isDirty', function(newValue) {
                if (newValue === true) {
                    $scope.startAutoSave();
                }
            });

            $scope.$watch('list.listType', function(newVal, oldVal) {
                if (!$scope.list || !$scope.list.id) {
                    return;
                }
                if (newVal && oldVal && newVal !== oldVal) {
                    $scope.glTypeChanged = true;
                }
            });
            
            $scope.$watchCollection('list', function(newVal) {
                if (!newVal) {
                    return;
                }
                $scope.gridOptions.data = $scope.list.guests;
            });

            $scope.gridOptions = {
                rowTemplate: '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.uid" ui-grid-one-bind-id-grid="rowRenderIndex + \'-\' + col.uid + \'-cell\'" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" role="{{col.isRowHeader ? \'rowheader\' : \'gridcell\'}}" ng-keydown="grid.appScope.gridCellTab($event, col)"><dl><dt hide-gt-sm ng-hide="col.name === \'\'">{{col.name}}</dt><dd ui-grid-cell class="ui-grid-cell"></dd></dl></div>',
                columnDefs: [
                    {field: 'firstName', name: 'First Name'},
                    {field: 'lastName', name: 'Last Name'},
                    {field: 'email', name: 'Email', enableSorting: false},
                    {field: 'notes', name: 'Note', enableSorting: false}
                ],
                enableCellEditOnFocus: true,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false,
                data: []
            };
            
            var instanceType = parseInt($stateParams.instanceType);
            if (instanceType !== 2){
                $scope.gridOptions.columnDefs.push({
                    field: 'plus',
                    name: 'Plus',
                    width: '90',
                    enableSorting: false
                });
            }
            
            if (instanceType !== 1 && instanceType > 0) {
                $scope.guestListTypes = ['RSVP'];
                $scope.list = $scope.list || {listType: 'RSVP'};
            }

            if ($scope.options.sorting !== undefined) {
                $scope.gridOptions.enableSorting = $scope.options.sorting;
            }
            
            angular.forEach($scope.gridOptions.columnDefs, function(value, key){
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
                if (!$scope.list) {
                    $scope.list = {};
                }
                
                if (!$scope.list.guests) {
                    $scope.list.guests = [];
                }

                $scope.list.guests.push(angular.extend({}, $scope.defaultFields));
                $scope.isDirty = true;
            };

            $scope.deleteSelectedRows = function() {
                if (!$scope.rowSelected) {
                    return;
                }
                $scope.fetchingData = true;
                $scope.cancelAutoSave();
                var guestIds = [],
                    rowsHash = [];
                angular.forEach($scope.rowSelected, function(row){
                    guestIds.push(row.id);
                    rowsHash.push(row.$$hashKey);
                });
                if ($scope.list.id) {
                    eventsService.removeGuestsFromGL($scope.list.id, guestIds).then(
                        function(data) {
                            $scope.list = data;
                        }
                    ).finally(function () {
                        $scope.fetchingData = false;
                    });
                } else {
                    var guests = [];
                    angular.forEach($scope.list.guests, function(guest){
                        if (rowsHash.indexOf(guest.$$hashKey) < 0) {
                            guests.push(guest);
                        }
                    });
                    $scope.list.guests = guests;
                    $scope.fetchingData = false;
                }
                $scope.rowSelected = false;
            };
            
            $scope.save = function(autoSave) {
                var errorMessage = [];
                if (!$scope.createGuestListForm.$valid) {
                    var errors = {
                        required: {
                            title: 'Please Enter Guest List Title',
                            listType: 'Please Select Guest Type'
                        }
                    };
                    angular.forEach($scope.createGuestListForm.$error.required, function(value){
                        errorMessage.push(errors.required[value.$name]);
                    });
                }
                /*if (!$scope.list || !$scope.list.guests || $scope.list.guests.length === 0) {
                    errorMessage.push('Please Add Guests');
                }*/
                if ($scope.guestsError()) {
                    errorMessage.push('First Name must be not empty.');
                }
                if (errorMessage.length > 0) {
                    if (!autoSave) {
                        dialogService.error(errorMessage.join(', '));
                    }
                    return;
                }
                
                $scope.fetchingData = true;
                $scope.cancelAutoSave();
                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }
                if ($scope.glTypeChanged) {
                    $scope.list.id = null;
                    $scope.list.title += ' ' + $scope.list.listType;
                }
                var list = {};
                angular.copy($scope.list, list);
                if (autoSave) {
                    list.guests.splice(list.guests.length - 1, 1);
                }
                guestFactory.GuestList.update(list).$promise.then(
                    function(data) {
                        if (!autoSave) {
                            $scope.list = data;
                        } else {
                            $scope.list.id = data.id;
                            var savedGuestsId = [],
                                newSavedGuests = [];
                            angular.forEach($scope.list.guests, function(guest) {
                                if (guest.id) {
                                    savedGuestsId.push(guest.id);
                                }
                            });
                            angular.forEach(data.guests, function(guest) {
                                if (savedGuestsId.indexOf(guest.id) === -1) {
                                    newSavedGuests.push(guest);
                                }
                            });
                            angular.forEach($scope.list.guests, function(guest, key) {
                                if (!guest.id) {
                                    angular.forEach(newSavedGuests, function(newGuest, newKey){
                                        if (guest.firstName === newGuest.firstName && guest.lastName === newGuest.lastName && guest.email === newGuest.email) {
                                            $scope.list.guests[key].id = newGuest.id;
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
                        if (!autoSave) {
                            if ($scope.onSave) {
                                $scope.onSave(data);
                            } else {
                                $state.go('main.edit_glist', {listId: data.id});
                            }
                        }
                    }, function() {
                        dialogService.error('There was a problem saving your guest list, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };
            
            $scope.guestsError = function() {
                var result = false;
                if (!$scope.list || !$scope.list.guests) {
                    return result;
                }
                angular.forEach($scope.list.guests, function(guest) {
                    result = result || (guest.firstName === '');
                });
                return result;
            };
            
            $scope.onFileSelect = function(files) {
                if (!files || files.length === 0) {
                    return;
                }
                if ($scope.list) {
                    $scope.cancelAutoSave();
                    $scope.fetchingData = true;
                    guestFactory.GuestList.update($scope.list).$promise.then(
                        function(data) {
                            $scope.list = data;
                            $scope.upload(files[0], $scope.list.id);
                        }, 
                        function() {
                            dialogService.error('There was a problem saving your guest list, please try again');
                        }
                    ).finally(function () {
                        $scope.fetchingData = false;
                    });
                    return;
                }
                $scope.upload(files[0]);
            };

            $scope.upload = function(files, glId) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestList(files, glId).then(
                    function(data) {
                        $scope.list = data;
                    },
                    function() {
                        dialogService.error('There was a problem saving your guest list please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.onLinkClicked = function(ev) {
                var scope = $scope.$new();
                scope.cancel = function() {
                    $mdDialog.hide();
                };
                scope.selected = [];
                scope.options = {
                    enableSelection: true,
                    readOnly: true,
                    verticalScroll: false
                };
                scope.importGLists = function(selected) {
                    $scope.list = $scope.list || {title: 'New Guest List'};
                    $scope.list.guests = $scope.list.guests || [];

                    eventsService.importGuestList($scope.list.id, selected, $scope.list).then(
                        function(result) {
                            if (!result) {
                                return dialogService.error('There was a problem linking your guest list, please try again');
                            }
                            $scope.list.guests = result.guests;
                        }, 
                        function() {
                            dialogService.error('There was a problem linking your guest list, please try again');
                        }
                    ).finally(function() {
                        $mdDialog.hide();
                    });
                };

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.init = function () {
                userService.getUsersByRole('promoter').then(
                    function(users){
                        $scope.promoters = [{Id: 0, firstName: 'None', lastName: ''}];
                        $scope.promoters = $scope.promoters.concat(users);
                    },
                    function() {
                        dialogService.error('Oops there was a problem loading promoter users, please try again');
                    }
                );
            };
            $scope.init();
        }]
    );