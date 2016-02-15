'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', 'uploaderService', 'eventsService', '$state', '$stateParams', 'userService', '$interval',
        function ($scope, guestFactory, dialogService, $mdDialog, uploaderService, eventsService, $state, $stateParams, userService, $interval) {

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
            $scope.gridOptions = {
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell></div>' +
                    '</div>',
                columnDefs: [
                    {field: 'firstName', name: 'First Name'},
                    {field: 'lastName', name: 'Last Name'},
                    {field: 'email', name: 'Email', enableSorting: false},
                    {field: 'phoneNumber', name: 'Note', enableSorting: false}
                ],
                rowHeight: 45,
                enableCellEditOnFocus: true,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false
            };
            var instanceType = parseInt($stateParams.instanceType);
            if (instanceType !== 2){
                $scope.gridOptions.columnDefs.push({
                    field: 'plus',
                    name: 'Plus',
                    width: '90',
                    enableHiding: false,
                    enableSorting: false
                });
            }
            if (instanceType !== 1 && instanceType > 0) {
                $scope.guestListTypes = ['RSVP'];
                $scope.list = $scope.list || {listType: 'RSVP'};
            }
            $scope.rowSelected = false;
            $scope.isDirty = false;

            $scope.gridOptions.onRegisterApi = function(gridApi) {
                //set gridApi on scope
                $scope.gridApi = gridApi;

                var rowSelectionChanged = function() {
                    $scope.rowSelected = $scope.gridApi.selection.getSelectedRows();
                    if ($scope.rowSelected.length === 0) {
                        $scope.rowSelected = false;
                    }
                };

                gridApi.cellNav.on.navigate($scope,function(newRowcol){
                    if (newRowcol.row.entity.$$hashKey === $scope.gridOptions.data[$scope.gridOptions.data.length - 1].$$hashKey && newRowcol.col.field === $scope.gridOptions.columnDefs[$scope.gridOptions.columnDefs.length - 1].field) {
                        $scope.addMore();
                    }
                });

                gridApi.selection.on.rowSelectionChanged($scope, rowSelectionChanged);
                gridApi.selection.on.rowSelectionChangedBatch($scope, rowSelectionChanged);
                
                gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                    if (newValue !== oldValue) {
                        $scope.isDirty = true;
                    }
                });
            };

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

            $scope.startAutoSave = function() {
                $scope.autoSave = $interval(function(){
                    if (!$scope.guestsError()) {
                        $scope.save(true);
                    }
                }, 10000);
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

                $scope.list.guests.push({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phoneNumber: '',
                    plus: 0
                });
                $scope.isDirty = true;
            };

            $scope.deleteSelectedRows = function() {
                if (!$scope.rowSelected) {
                    return;
                }
                $scope.cancelAutoSave();
                $scope.fetchingData = true;
                var guestIds = [];
                angular.forEach($scope.rowSelected, function(row){
                    guestIds.push(row.id);
                });
                eventsService.removeGuestsFromGL($scope.list.id, guestIds).then(
                    function(data) {
                        $scope.list = data;
                    }
                ).finally(function () {
                    $scope.fetchingData = false;
                });
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
                
                $scope.cancelAutoSave();
                $scope.fetchingData = true;
                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }
                if ($scope.glTypeChanged) {
                    $scope.list.id = null;
                    $scope.list.title += ' ' + $scope.list.listType;
                }
                guestFactory.GuestList.update($scope.list).$promise.then(
                    function(data) {
                        $scope.list = data;
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
                    readOnly: true
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