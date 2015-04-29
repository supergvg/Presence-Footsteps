angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {
            'use strict';

            $scope.eventCategories = [
                'Art',
                'Fashion',
                'Music',
                'Charity',
                'Technology',
                'Gaming'
            ];

            $scope.data = {
                selectedIndex: 0
            };

            $scope.glmOptions = {
                hideManualImport: true
            }

            $scope.event = $scope.event || {
                title: '',
                guestLists: []
            };


            $scope.onAddGLClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = _.map($scope.event.guestLists, function (gli) {
                    return  gli.linked_guest_list;
                });

                scope.options = {
                    enableSelection: true
                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };

                $scope.importGLists = function () {
                    eventsService.linkGuestList(scope.selected, $scope.event.id).then(
                        function (guestListInstances) {
                            $scope.event.guestLists = guestListInstances;
                            dialogService.success('Guest lists were linked');
                            $mdDialog.hide();
                        }, function () {
                            dialogService.error('There was a problem linking, please try again');
                        }
                    );
                };

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-import-dialog.html',
                    targetEvent: ev
                });
            }


            $scope.onCreateNewGuestList = function (ev) {

                var scope = $scope.$new();

                scope.currentGlist = {
                    title: 'New Guest List',
                    guests: []

                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };

                scope.save = function () {
                    $scope.event.guestLists.push(scope.currentGlist);
                };

                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/guest-lists/templates/glist-edit-dialog.tmpl.html',
                    targetEvent: ev
                });

            }


            $scope.displayErrorMessage = function (field) {
                return ($scope.showValidation) || (field.$touched && field.$error.required);
            };


            $scope.next = function (form) {
                if (form && form.$invalid) {
                    $scope.showValidation = true;
                    return;
                }

                if ($scope.data.selectedIndex == 0) {
                    $scope.savingEvent = true;
                    eventsService.createEvent($scope.event).then(
                        function (res) {
                            $scope.event.id = res.id;
                            $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
                            dialogService.success('Event ' + res.title + 'created');

                        }, function () {
                            dialogService.error('There was a problem saving your event, please try again');
                        }
                    ).finally(
                        function () {
                            $scope.savingEvent = false;
                        }
                    );

                    return;
                }

                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };


            $scope.createEvent = function () {
                $scope.savingEvent = true;
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        $scope.event.id = res.id;
                        dialogService.success('Event ' + res.event.title + 'created');

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                ).finally(
                    function () {
                        $scope.savingEvent = false;
                    }
                )
            };

        }]);
