'use strict';

angular.module('gliist')
    .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'eventsService', 'userService', '$interval', '$mdDialog', 'uploaderService', '$rootScope',
        function ($scope, guestFactory, dialogService, $state, eventsService, userService, $interval, $mdDialog, uploaderService, $rootScope) {
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
            $scope.options = {
                filter: {
                    active: true,
                    placeholder: 'Search Guest',
                    fields: ['guest.firstName', 'guest.lastName']
                },
                sorting: {
                    active: true
                },
                display: {
                    totalMobileViewportItems: 2,
                    totalViewportItems: 7,
                    enableGridSelection: true,
                    enableEditCells: true
                },
                gridOptions: {
                    columnDefs: [
                        {field: 'guest.firstName', name: 'First Name'},
                        {field: 'guest.lastName', name: 'Last Name'},
                        {field: 'guest.email', name: 'Email', enableSorting: false},
                        {field: 'guest.notes', name: 'Note', enableSorting: false},
                        {field: 'guest.plus', name: 'Plus', enableSorting: false}
                    ]
                }
            };
            $scope.options.methods = {
                updateGridData: function() {
                    if ($scope.gli) {
                        var data = [];
                        angular.copy($scope.options.gridOptions.data, data);
                        angular.copy(data, $scope.gli.actual);
                    }
                },                
                gridCellTab: function(event, col) {
                    if (event.keyCode === 9 && col.uid === col.grid.columns[col.grid.columns.length - 1].uid) {
                        $scope.addMore();
                    }
                },
                onRegisterApi: function(gridApi){
                    var rowSelectionChanged = function() {
                        $scope.rowSelected = gridApi.selection.getSelectedRows();
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
                }
            };
            $scope.rowSelected = false;
            $scope.isDirty = false;

            $scope.$watchCollection('gli', function(newVal) {
                if (!newVal) {
                    return;
                }
                $scope.options.gridOptions.data = $scope.gli.actual;
            });

            $scope.$watch('isDirty', function(newValue) {
                if (newValue === true) {
                    $scope.startAutoSave();
                }
            });

            $scope.$watch('id', function(newValue) {
                if (!newValue) {
                    return;
                }
                $scope.loading = true;
                guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function(data) {
                    $scope.gli = data;
                    if ($scope.gli.instanceType === 2) {
                        $scope.options.gridOptions.columnDefs.splice(4);
                    }
                    userService.getUsersByRole('promoter').then(
                        function(users){
                            $scope.promoters = [{Id: 0, firstName: 'None', lastName: ''}];
                            $scope.promoters = $scope.promoters.concat(users);
                            $scope.loading = false;
                        },
                        function() {
                            dialogService.error('Oops there was a problem loading promoter users, please try again');
                        }
                    );
                }, function() {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(function() {
                    $scope.loading = false;
                });
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
                    if (row.guest.id) {
                        guestIds.push(row.guest.id);
                    } else {
                        var index = $scope.gli.actual.indexOf(row);
                        if (index > -1) {
                            $scope.gli.actual.splice(index, 1);
                        }
                    }
                });
                if (guestIds.length > 0) {
                    eventsService.removeGuestsFromGLInstance($scope.gli.id, guestIds).then(
                        function(data) {
                            $scope.gli = data;
                        }
                    ).finally(function () {
                        $scope.fetchingData = false;
                    });
                } else {
                    $scope.fetchingData = false;
                }
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

            $scope.isPromoter = function () {
                return $rootScope.isPromoter();
            };

            $scope.onLinkClicked = function (ev) {
                var scope = $scope.$new();
                scope.cancel = function () {
                    $mdDialog.hide();
                };
                scope.selected = [];
                scope.options = {
                    display: {
                        enableSelection: true,
                        readOnly: true,
                        verticalScroll: false
                    }
                };
                scope.importGLists = function (selected) {
                    $scope.gli = $scope.gli || {title: 'New Guest List'};
                    $scope.gli.guests = $scope.gli.guests || [];

                    eventsService.importGuestsToGLInstance($scope.gli.id, selected, $scope.gli).then(
                        function (result) {
                            if (!result) {
                                return dialogService.error('There was a problem linking your guest list, please try again');
                            }
                            $scope.gli.actual = result.actual;
                        },
                        function () {
                            dialogService.error('There was a problem linking your guest list, please try again');
                        }
                    ).finally(function () {
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
            
            $scope.onFileSelect = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                if ($scope.gli) {
                    var gli = angular.copy($scope.gli, {});
                    $scope.cancelAutoSave();
                    $scope.fetchingData = true;
                    guestFactory.GuestListInstance.update(gli).$promise.then(
                        function (data) {
                            $scope.gli = data;
                            $scope.upload(files[0], $scope.gli.id);
                        },
                        function () {
                            $scope.fetchingData = false;
                            dialogService.error('There was a problem saving your guest list, please try again');
                        }
                    );
                    return;
                }
                $scope.upload(files[0]);
            };

            $scope.upload = function (files, glId) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestListInstance(files, glId).then(
                    function (data) {
                        $scope.gli = data;
                    },
                    function () {
                        dialogService.error('There was a problem saving your guest list please try again');
                    }
                ).finally(function () {
                    $scope.fetchingData = false;
                });
            };
        }]
    );
