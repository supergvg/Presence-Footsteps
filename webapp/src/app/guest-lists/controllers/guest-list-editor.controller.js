'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService', 'eventsService', '$state', '$stateParams', 'userService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService, eventsService, $state, $stateParams, userService) {

            var instanceType = ~~$stateParams.instanceType,
                columnDefs = [
                    {field: 'firstName', name: 'First Name'},
                    {field: 'lastName', name: 'Last Name'},
                    {field: 'email', name: 'Email', enableSorting: false},
                    {field: 'phoneNumber', name: 'Note', enableSorting: false}
                ]; 
            if (instanceType !== 2){
                    columnDefs.push({
                        field: 'plus',
                        name: 'Plus',
                        width: '90',
                        enableHiding: false,
                        enableSorting: false
                    });
            }

            $scope.gridOptions = {
                rowTemplate: '<div>' +
                    '<div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" ' +
                    'class="ui-grid-cell" ui-grid-cell></div>' +
                    '</div>',
                columnDefs: columnDefs,
                rowHeight: 45,
                tabIndex: 0,
                enableCellSelection: true,
                enableCellEditOnFocus: true,
                noTabInterference: true,
                selectionRowHeaderWidth: 50,
                enableColumnMenus: false
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
                'All Access'
            ];
            if (instanceType !== 1 && instanceType > 0) {
                $scope.guestListTypes = ['RSVP'];

                $scope.list = $scope.list || {};

                $scope.list.listType = 'RSVP';
            }

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

                eventsService.removeGuestsFromGL($scope.list.id, guestsIds).then(
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

            $scope.guestsError = function() {
                if (!$scope.list || !$scope.list.guests) {
                    return true;
                }
                var result = false;
                angular.forEach($scope.list.guests, function(value, key) {
                    result = result || (value.firstName === '') || (value.lastName === '');
                });
                return result;
            };
            
            $scope.onFileSelect = function (files) {
                if (!files || files.length === 0) {
                    return;
                }

                if ($scope.list) {

                    $scope.fetchingData = true;

                    guestFactory.GuestList.update($scope.list).$promise.then(
                        function (res) {
                            _.extend($scope.list, res);
                            $scope.isDirty = false;

                            $scope.upload(files[0], $scope.list.id);

                        }, function () {
                            dialogService.error('There was a problem saving your guest list, please try again');
                            $scope.fetchingData = false;
                        }).finally(function () {
                        });

                    return;
                }

                $scope.upload(files[0]);
            };


            $scope.upload = function (files, glId) {
                $scope.fetchingData = true;
                uploaderService.uploadGuestList(files, glId).then(function (data) {

                        if (!$scope.list) {
                            $scope.list = {};
                        }

                        _.extend($scope.list, data);
                    },
                    function() {
                        dialogService.error('There was a problem saving your guest list please try again');
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                );
            };

            $scope.onLinkClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = [];
                scope.options = {
                    enableSelection: true,
                    readOnly: true
                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };


                scope.importGLists = function (selected) {

                    $scope.list = $scope.list || {title: 'New Guest List'};
                    $scope.list.guests = $scope.list.guests || [];


                    eventsService.importGuestList($scope.list.id, selected, $scope.list).then(function (res) {

                        if (!res) {
                            return dialogService.error('There was a problem linking your guest list, please try again');
                        }

                        $scope.list.guests = res.guests;

                    }, function () {
                        dialogService.error('There was a problem linking your guest list, please try again');
                    }).finally(
                        function () {
                            $mdDialog.hide();
                        }
                    );

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

            $scope.$watch('list.listType', function (newVal, oldVal) {

                if (!$scope.list || !$scope.list.id) {
                    return;
                }


                if(newVal === 'RSVP') {
                    $scope.guestListTypes = ['RSVP'];
                }

                if (newVal && oldVal && (newVal !== oldVal)) {
                    $scope.glTypeChanged = true;
                }
            });

            $scope.save = function (goBack) {
                var errorMessage = [];
                if (!$scope.createGuestListForm.$valid || !$scope.isDirty) {
                    var errors = {
                        required: {
                            title: 'Please Enter Guest List Title',
                            listType: 'Please Select Guest Type'
                        }
                    };
                    angular.forEach($scope.createGuestListForm.$error.required, function(value, key){
                        errorMessage.push(errors.required[value.$name]);
                    });
                    $scope.showValidation = false;
                }
                /*if (!$scope.list || !$scope.list.guests || $scope.list.guests.length === 0) {
                    errorMessage.push('Please Add Guests');
                }
                if ($scope.guestsError()) {
                    errorMessage.push('First Name and Last Name must be not empty.');
                }*/
                if (errorMessage.length > 0) {
                    dialogService.error(errorMessage.join(', '));
                    return;
                }
                
                $scope.fetchingData = true;

                if (!$scope.list.listType) {
                    $scope.list.listType = 'GA';
                }

                if ($scope.glTypeChanged) {
                    $scope.list.id = null;
                    $scope.list.title += ' ' + $scope.list.listType;
                }

                guestFactory.GuestList.update($scope.list).$promise.then(
                    function (res) {
                        _.extend($scope.list, res);
                        dialogService.success('Guest list saved');
                        $scope.isDirty = false;

                        if ($scope.onSave && goBack) {
                            $scope.onSave(res);
                        } else {
                            $state.go('main.edit_glist', {listId: res.id});
                        }

                    }, function () {
                        dialogService.error('There was a problem saving your guest list, please try again');
                    }).finally(function () {
                        $scope.fetchingData = false;
                    });
            };
            
            $scope.displayErrorMessage = function(field) {
                return false;
                //return ($scope.showValidation) || (field.$touched && field.$error.required);
            };

            $scope.init = function () {

                if (!$scope.options) {
                    $scope.options = {};
                }
                
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

        }]);
