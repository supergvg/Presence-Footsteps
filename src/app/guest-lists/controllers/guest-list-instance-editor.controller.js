'use strict';

angular.module('gliist')
    .controller('GuestListInstanceEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$state', 'eventsService', 'userService', '$interval', '$timeout', '$mdDialog', 'uploaderService', '$rootScope', 'guestListParserService', '$stateParams', '$mdTheming',
        function ($scope, guestFactory, dialogService, $state, eventsService, userService, $interval, $timeout, $mdDialog, uploaderService, $rootScope, guestListParserService, $stateParams, $mdTheming) {
            var instanceType = parseInt($stateParams.instanceType);

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
            $scope.canEdit = function () {
                return !$scope.fetchingData;
            };
            $scope.canEditPlus = function () {
                return !(instanceType === 2 || instanceType === 4); //disable editing for RSVP list
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
                    cellEditableCondition : $scope.canEdit,
                    columnDefs: [
                        {field: 'guest.firstName', name: 'First Name'},
                        {field: 'guest.lastName', name: 'Last Name'},
                        {field: 'guest.email', name: 'Email', enableSorting: false},
                        {field: 'guest.notes', name: 'Note', enableSorting: false},
                        {field: 'guest.plus', name: 'Plus', enableSorting: false, cellEditableCondition: $scope.canEditPlus}
                    ]
                }
            };
            $scope.form = {};
            
            $scope.options.methods = {
                gridCellTab: function(event, col) {
                    if (event.keyCode === 9 && col.uid === col.grid.columns[col.grid.columns.length - 1].uid) {
                        $scope.addMore();
                        $timeout(function(){
                            $scope.gridApi.cellNav.scrollToFocus($scope.gli.actual[$scope.gli.actual.length - 1], $scope.options.gridOptions.columnDefs[0]);
                        }, 100);
                    }
                },
                onRegisterApi: function(gridApi){
                    $scope.gridApi = gridApi;
                    var rowSelectionChanged = function() {
                        $scope.rowSelected = gridApi.selection.getSelectedRows();
                        if ($scope.rowSelected.length === 0) {
                            $scope.rowSelected = false;
                        }
                    };

                    gridApi.selection.on.rowSelectionChanged($scope, rowSelectionChanged);
                    gridApi.selection.on.rowSelectionChangedBatch($scope, rowSelectionChanged);

                    gridApi.edit.on.beginCellEdit($scope,function(rowEntity, colDef, triggerEvent){
                        $scope.cancelAutoSave();
                    });

                    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        if (newValue !== oldValue)
                            $scope.onDataChange();
                        else
                            $scope.startAutoSave();
                    });

                    gridApi.edit.on.cancelCellEdit($scope,function(rowEntity, colDef){
                        $scope.startAutoSave();
                    });
                }
            };
            $scope.rowSelected = false;
            $scope.isDirty = false;

            $scope.$watchCollection('gli', function(newVal) {
                if (!newVal) {
                    return;
                }
                $scope.options.gridData = $scope.gli.actual;
            });

            $scope.$watch('id', function(newValue) {
                if (!newValue) {
                    return;
                }
                $scope.loading = true;
                guestFactory.GuestListInstance.get({id: $scope.id}).$promise.then(function(data) {
                    $scope.gli = data;
                    instanceType = data.instanceType;

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
                if ($scope.isDirty === false)
                    return;

                $scope.cancelAutoSave();
                $scope.autoSave = $timeout(function(){
                    if (!$scope.guestsError() && !$scope.fetchingData) {
                        $scope.save(true);
                    }
                }, 7000);
            };
            $scope.cancelAutoSave = function() {
                if ($scope.autoSave) {
                    $timeout.cancel($scope.autoSave);
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
            
            $scope.save = function(autoSave, forceSaveGuest, onSuccess) {
                var errorMessage = [];
                if (!$scope.form.createGuestListForm.$valid) {
                    var errors = {
                        required: {
                            title: 'Please Enter Guest List Title',
                            listType: 'Please Select Guest Type'
                        }
                    };
                    angular.forEach($scope.form.createGuestListForm.$error.required, function(value){
                        errorMessage.push(errors.required[value.$name]);
                    });
                }
                if ($scope.guestsError()) {
                    errorMessage.push(instanceType === 2 || instanceType === 4 ? 'Email must be not empty.' : 'First Name must be not empty.');
                }
                if (errorMessage.length > 0) {
                    if (!autoSave) {
                        dialogService.error(errorMessage.join(', '));
                    }
                    return;
                }
                
                /*if (!forceSaveGuest) { //will cause second check before sending data
                    var list = $scope.gli.actual.slice();
                    var duplicated = [];
                    
                    var i = 0;
                    while (list[i]) {
                        var fn = list[i].guest.firstName;
                        var ln = list[i].guest.lastName;
                        
                        for (var j = i; j < list.length; j++) {
                            if (fn === list[j].guest.firstName && ln === list[j].guest.lastName && i != j) {
                                duplicated.push(list[j].guest);
                                list.splice(j, 1); //remove from temporary list to eliminate cross-checking
                                j--;
                            }
                        }

                        i++;
                    }
                    
                    if (duplicated.length)
                        return $scope.confirmDuplicatedGuests(autoSave, duplicated);
                }*/
                
                var gli = {};
                if (!$scope.gli.listType) {
                    $scope.gli.listType = 'GA';
                }
                angular.copy($scope.gli, gli);
                if (forceSaveGuest)
                    gli.ForceSaveGuest = true;
                    
                $scope.cancelAutoSave();
                $scope.fetchingData = true;
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
                        $scope.isDirty = false;
                        if (onSuccess) {
                            onSuccess(function() {
                                if ($scope.onSave && !autoSave) {
                                    $scope.onSave(data);
                                }
                            });
                        } else if ($scope.onSave && !autoSave) {
                            $scope.onSave(data);
                        }
                        
                    }, function(error) {
                        if (error.status === 409)
                            $scope.confirmDuplicatedGuests(autoSave, error.data);
                        else
                            dialogService.error(error.data.Message || 'There was a problem saving your guest list, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.confirmDuplicatedGuests = function (autoSave, list) {
                var htmlcontent = '<p>These names are already in the guest list:</p>\n<ul>';
                angular.forEach(list, function(item) {
                    htmlcontent += '<li>' + item.firstName + ' ' + item.lastName + '</li>'
                });
                htmlcontent += '</ul><p>Do you want to delete them?</p>';

                $mdDialog.show({
                    template: [
                        '<md-dialog md-theme="{{ dialog.theme }}" aria-label="">',
                        '<md-dialog-content role="document" tabIndex="-1">',
                        htmlcontent,
                        '</md-dialog-content>',
                        '<div class="md-actions">',
                        '<md-button ng-click="dialog.hide()" class="md-primary">Yes</md-button>',
                        '<md-button ng-click="dialog.abort()" class="md-primary">No</md-button>',
                        '</div>',
                        '</md-dialog>'
                    ].join(''),
                    controller: function mdDialogCtrl() {
                        this.hide = function() {
                            $mdDialog.hide(true);
                        };
                        this.abort = function() {
                            $mdDialog.cancel();
                        };
                    },
                    controllerAs: 'dialog',
                    bindToController: true,
                    theme: $mdTheming.defaultTheme()
                }).then(function() {
                    var ids = [];
                    angular.forEach(list, function(item) {
                        if (item.id === 0) { //id = 0 if returned by back end
                            var l = $scope.gli.actual;
                            var i = 0;
                            while(l[i]) {
                                if (l[i].guest.firstName === item.firstName && l[i].guest.lastName === item.lastName && l[i].guest.id === undefined) {
                                    l.splice(i, 1);
                                    i--;
                                }
                                i++;
                            }
                        } else if (item.id === undefined) { //id = undefined if returned by front end
                            var l = $scope.gli.actual;
                            var i = 0;
                            while(l[i]) {
                                if (l[i].guest === item) {
                                    l.splice(i, 1);
                                    i--;
                                }
                                i++;
                            }
                        } else //remove on back end
                            ids.push(item.id);
                    });
                    
                    if (ids.length) {
                        $scope.save(autoSave, true, function(onSave) {
                            $scope.fetchingData = true;
                            eventsService.removeGuestsFromGLInstance($scope.gli.id, ids).then( function(data) {
                                $scope.gli = data;
                                if (onSave)
                                    onSave();
                            }).finally(function () {
                                $scope.fetchingData = false;
                            });
                        });
                    } else
                        $scope.save(autoSave);
                }, function() {
                    $scope.save(autoSave, true);
                });
            };
            
            $scope.guestsError = function() {
                var result = false;
                if (!$scope.gli) {
                    return result;
                }
                
                var guestCount = $scope.gli.actual.length,
                    verifyField = 'firstName';
                if (instanceType === 2 || instanceType === 4) { //if RSVP or Public RSVP
                    verifyField = 'email';
                }
                for (var i = 0; i < guestCount; i++) {
                    if ($scope.gli.actual[i].guest[verifyField] === '') {
                        return true;
                    }
                }
                    
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
                            $scope.save(true);
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
            
            $scope.onAddGuestsClicked = function() {
                if (!$scope.textGuestList) {
                    return;
                }
                
                var guests = guestListParserService.parse($scope.textGuestList);
                if (guests === null) {
                    return dialogService.error('No guests found in the list');
                }
                if (typeof guests === 'string') {
                    return dialogService.error(guests);
                }
                
                //import
                if (!$scope.gli) {
                    $scope.gli = {};
                }
                if (!$scope.gli.actual) {
                    $scope.gli.actual = [];
                }
                
                var guestCount = guests.length;
                for (var i = 0; i < guestCount; i ++) {
                    $scope.gli.actual.push({
                        gl_id: $scope.gli.id,
                        status: 'no show',
                        guest: guests[i]
                    });
                }
                $scope.isDirty = true;
                
                dialogService.success('Guests were added successfully');
                $scope.onDataChange();
                $scope.textGuestList = '';
            };
            
            $scope.onFileSelect = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                if ($scope.gli) {
                    var gli = angular.copy($scope.gli, {});
                    $scope.cancelAutoSave();
                    $scope.fetchingData = true;
                    $scope.save(true, true, function(onSave){
                        $scope.upload(files[0], $scope.gli.id);
                        if (onSave)
                            onSave();
                    });
                    return;
                }
                $scope.upload(files[0]);
            };
            
            $scope.onDataChange = function () {
                $scope.isDirty = true;
                $scope.startAutoSave();
            };

            $scope.upload = function (files, glId) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestListInstance(files, glId).then(
                    function (data) {
                        $scope.gli = data;
                        $scope.save(true);
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
