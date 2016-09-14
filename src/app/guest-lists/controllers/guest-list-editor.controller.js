'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', 'uploaderService', 'eventsService', '$state', '$stateParams', 'userService', '$timeout', 'guestListParserService', 'permissionsService', '$mdTheming',
        function ($scope, guestFactory, dialogService, $mdDialog, uploaderService, eventsService, $state, $stateParams, userService, $timeout, guestListParserService, permissionsService, $mdTheming) {
            $scope.mustBeLinked = $scope.linkToEvent ? true : false; //if no linkToEvent callback specified the list doesn't need linking
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
            $scope.options = {
                filter: {
                  active: true,
                  placeholder: 'Search Guest',
                  fields: ['firstName', 'lastName', 'email'],
                  filterFunction: function(renderableRows, filterValue, originalFilter, fieldFilter) {
                    var filterWords;
                    var firstNameField = $scope.options.filter.fields[0];
                    var lastNameField = $scope.options.filter.fields[1];
                    var firstNameFilter;
                    var lastNameFilter;
                    if (filterValue.indexOf(' ') !== -1) {
                      filterWords = filterValue.split(/\s+/);
                      firstNameFilter = new RegExp('^' + filterWords[0], 'i');
                      lastNameFilter = new RegExp('^' + filterWords[1], 'i');
                      renderableRows.forEach(function(row) {
                        var match = fieldFilter(row, firstNameField, firstNameFilter)
                          && fieldFilter(row, lastNameField, lastNameFilter);
                        if (!match) {
                          row.visible = false;
                        }
                      });
                      return renderableRows;
                    } else {
                      return originalFilter(renderableRows, filterValue);
                    }
                  }
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
                        {field: 'firstName', name: 'First Name'},
                        {field: 'lastName', name: 'Last Name'},
                        {field: 'email', name: 'Email', enableSorting: false},
                        {field: 'notes', name: 'Note', enableSorting: false}
                    ]
                }
            };
            $scope.form = {};
            $scope.vars = {};

            var instanceType = parseInt($stateParams.instanceType);
            if (!instanceType) {
                $scope.guestListTypes.splice(8, 0, 'RSVP');
            }
            if (instanceType !== 2){
                $scope.options.gridOptions.columnDefs.push({
                    field: 'plus',
                    type: 'number',
                    name: 'Plus',
                    width: '90',
                    enableSorting: false,
                    editableCellTemplate: '<div><form name="inputForm"><input type="INPUT_TYPE" ng-class="\'colt\' + col.uid" ui-grid-editor ng-model="MODEL_COL_FIELD" min="0"></form></div>'
                });
            }
            if (instanceType !== 1 && instanceType > 0) {
                $scope.guestListTypes = ['RSVP'];
                $scope.list = $scope.list || {listType: 'RSVP'};
            }
            $scope.options.methods = {
                gridCellTab: function(event, col) {
                    if (event.keyCode === 9 && col.uid === col.grid.columns[col.grid.columns.length - 1].uid) {
                        $scope.addMore();
                        $timeout(function(){
                            $scope.gridApi.cellNav.scrollToFocus($scope.list.guests[$scope.list.guests.length - 1], $scope.options.gridOptions.columnDefs[0]);
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

                    gridApi.edit.on.beginCellEdit($scope,function(){
                        $scope.cancelAutoSave();
                    });

                    gridApi.edit.on.afterCellEdit($scope,function(rowEntity, colDef, newValue, oldValue){
                        if (newValue !== oldValue) {
                            $scope.onDataChange();
                        } else {
                            $scope.startAutoSave();
                        }
                    });

                    gridApi.edit.on.cancelCellEdit($scope,function(){
                        $scope.startAutoSave();
                    });
                }
            };
            $scope.rowSelected = false;
            $scope.isDirty = false;

            $scope.$watch('list.listType', function(newVal, oldVal) {
                if (!$scope.list || !$scope.list.id) {
                    return;
                }
                if (newVal && oldVal && newVal !== oldVal) {
                    $scope.glTypeChanged = true;
                }
            });

            $scope.$watchCollection('list.guests', function(newVal) {
                if (!newVal) {
                    return;
                }
                $scope.options.gridData = $scope.list.guests;
            });

            $scope.isPromoter = function() {
                return permissionsService.isRole('promoter');
            };

            $scope.isSpotType = function() {
                if (!$scope.list) {
                    return false;
                }
                return $scope.list.listType === 'On the spot';
            };

            $scope.startAutoSave = function() {
                if ($scope.isDirty === false) {
                    return;
                }

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
                if ($scope.isSpotType()) {
                    return;
                }
                if (!$scope.list) {
                    $scope.list = {};
                }
                if (!$scope.list.guests) {
                    $scope.list.guests = [];
                }
                $scope.list.guests.push(angular.extend({}, $scope.defaultFields));
            };

            $scope.deleteSelectedRows = function() {
                if (!$scope.rowSelected) {
                    return;
                }
                $scope.fetchingData = true;
                $scope.cancelAutoSave();
                var guestIds = [];
                angular.forEach($scope.rowSelected, function(row){
                    if (row.id && $scope.list.id) {
                        guestIds.push(row.id);
                    } else {
                        var index = $scope.list.guests.indexOf(row);
                        if (index > -1) {
                            $scope.list.guests.splice(index, 1);
                        }
                    }
                });
                if (guestIds.length > 0) {
                    eventsService.removeGuestsFromGL($scope.list.id, guestIds).then(
                        function(data) {
                            $scope.list = data;
                        }
                    ).finally(function () {
                        $scope.fetchingData = false;
                    });
                } else {
                    $scope.fetchingData = false;
                }
                $scope.rowSelected = false;
            };

            $scope.validateForm = function () {
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
                    errorMessage.push(instanceType === 2 || instanceType === 4 || $scope.list.listType === 'RSVP' ? 'Email must be not empty.' : 'First Name must be not empty.');
                }

                return errorMessage;
            };

            $scope.save = function(autoSave, forceSaveGuest, onSuccess) {
                var errors = $scope.validateForm();
                if (errors.length) {
                    if (!autoSave) {
                        dialogService.error(errors.join(', '));
                    }
                    return;
                }

                if ($scope.onBeforeSave && !$scope.onBeforeSave($scope.list, !autoSave)) {
                    return;
                }
                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }

                /*if (!forceSaveGuest) {
                    var list = $scope.list.guests.slice();
                    var duplicated = [];

                    var i = 0;
                    while (list[i]) {
                        var fn = list[i].firstName;
                        var ln = list[i].lastName;

                        for (var j = i; j < list.length; j++) {
                            if (fn === list[j].firstName && ln === list[j].lastName && i != j) {
                                duplicated.push(list[j]);
                                list.splice(j, 1); //remove from temporary list to eliminate cross-checking
                                j--;
                            }
                        }

                        i++;
                    }

                    if (duplicated.length)
                        return $scope.confirmDuplicatedGuests(autoSave, duplicated);
                }*/

                var list = {};
                angular.copy($scope.list, list);

                $scope.cancelAutoSave();
                $scope.fetchingData = true;
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
                        $scope.isDirty = false;

                        if (onSuccess) { //fire onSuccess before onSave
                            var sc = function() {
                                if ($scope.onSave) {
                                    $scope.onSave(data, autoSave);
                                } else if (!autoSave) {
                                    $state.go('main.list_management', {listId: data.id});
                                }
                            };

                            if ($scope.mustBeLinked) {//link before continuing
                                $scope.linkToEvent(data).then(function(){
                                    $scope.mustBeLinked = false;
                                    onSuccess(sc);
                                });
                            } else {
                                onSuccess(sc);
                            }
                        } else if ($scope.onSave) {
                            if ($scope.mustBeLinked) {
                                $scope.linkToEvent(data).then(function(){
                                    $scope.mustBeLinked = false;
                                    $scope.onSave(data, autoSave);
                                });
                            } else {
                                $scope.onSave(data, autoSave);
                            }
                        } else if (!autoSave) {
                            $state.go('main.list_management', {listId: data.id});
                        }
                    }, function(error) {
                        dialogService.error(error.data.Message || 'There was a problem saving your guest list, please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.confirmDuplicatedGuests = function (autoSave, list) {
                var htmlcontent = '<p>These names are already in the guest list:</p>\n<ul>';
                angular.forEach(list, function(item) {
                    htmlcontent += '<li>' + item.firstName + ' ' + item.lastName + '</li>';
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
                        var l = $scope.list.guests;
                        var i = 0;
                        if (item.id === 0) { //id = 0 if returned by back end
                            while(l[i]) {
                                if (l[i].firstName === item.firstName && l[i].lastName === item.lastName && l[i].id === undefined) {
                                    l.splice(i, 1);
                                    i--;
                                }
                                i++;
                            }
                        } else if (item.id === undefined) { //id = undefined if returned by front end
                            while(l[i]) {
                                if (l[i] === item) {
                                    l.splice(i, 1);
                                    i--;
                                }
                                i++;
                            }
                        } else {//remove on back end
                            ids.push(item.id);
                        }
                    });

                    if (ids.length) {
                        $scope.save(autoSave, true, function(onSave) {
                            $scope.fetchingData = true;
                            eventsService.removeGuestsFromGL($scope.list.id, ids).then( function(data) {
                                $scope.list = data;
                                if (onSave) {
                                    onSave();
                                }
                            }).finally(function () {
                                $scope.fetchingData = false;
                            });
                        });
                    } else {
                        $scope.save(autoSave);
                    }
                }, function() {
                    $scope.save(autoSave, true);
                });
            };

            $scope.guestsError = function() {
                var result = false;
                if (!$scope.list || !$scope.list.guests) {
                    return result;
                }

                var guestCount = $scope.list.guests.length,
                    verifyField = 'firstName';
                if (instanceType === 2 || instanceType === 4 || $scope.list.listType === 'RSVP') { //if RSVP or Public RSVP
                    verifyField = 'email';
                }
                for (var i = 0; i < guestCount; i++) {
                    if ($scope.list.guests[i][verifyField] === '') {
                        return true;
                    }
                }

                return result;
            };

            $scope.onFileSelect = function(files) {
                if (!files || files.length === 0) {
                    return;
                }

                var errors = $scope.validateForm();
                if (errors.length) {
                    return dialogService.error(errors.join(', '));
                }

                $scope.cancelAutoSave();
                $scope.save(true, true, function(onSave){
                    $scope.upload(files[0], $scope.list.id);
                    if (onSave) {
                        onSave();
                    }
                });
            };

            $scope.upload = function(files, glId) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestList(files, glId).then(
                    function(data) {
                        $scope.list = data;
                        $scope.save(true);
                    },
                    function() {
                        dialogService.error('There was a problem saving your guest list please try again');
                    }
                ).finally(function() {
                    $scope.fetchingData = false;
                });
            };

            $scope.onLinkClicked = function(ev) {
                var errors = $scope.validateForm();
                if (errors.length) {
                    return dialogService.error(errors.join(', '));
                }

                var scope = $scope.$new();
                scope.cancel = function() {
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
                scope.importGLists = function() {
                    $scope.cancelAutoSave();
                    $scope.save(true, true, function(onSave){
                        eventsService.importGuestList($scope.list.id, scope.selected, $scope.list).then(
                        function(result) {
                            if (!result) {
                                return dialogService.error('There was a problem linking your guest list, please try again');
                            }
                            $scope.list.guests = result.guests;
                            $scope.save(true);
                        },
                        function(err) {
                            dialogService.error(err && err.Message ? err.Message : 'There was a problem linking your guest list, please try again');
                        }
                    ).finally(function() {
                        $mdDialog.hide();
                    });
                        if (onSave) {
                            onSave();
                        }
                    });
                };

                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
                    targetEvent: ev
                });
            };

            $scope.onAddGuestsClicked = function() {
                if (!$scope.vars.textGuestList) {
                    return;
                }

                var guests = guestListParserService.parse($scope.vars.textGuestList);
                if (guests === null) {
                    return dialogService.error('No guests found in the list');
                }
                if (typeof guests === 'string') {
                    return dialogService.error(guests);
                }

                //import
                if (!$scope.list) {
                    $scope.list = {};
                }
                if (!$scope.list.guests) {
                    $scope.list.guests = [];
                }

                var guestCount = guests.length;
                for (var i = 0; i < guestCount; i ++) {
                    $scope.list.guests.push(guests[i]);
                }

                dialogService.success('Guests were added successfully');
                $scope.onDataChange();
                $scope.vars.textGuestList = '';
            };

            $scope.onDataChange = function () {
                $scope.isDirty = true;
                $scope.startAutoSave();
            };

            $scope.init = function() {
                $scope.loading = true;
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
            };
            $scope.init();
        }]
    );
