angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService', 'uploaderService', '$state',
        function ($scope, $mdDialog, eventsService, dialogService, uploaderService, $state) {
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
                selectedIndex: 1,
                bottom: 'bottom'
            };

            $scope.glmOptions = {
                hideManualImport: true
            }

            $scope.event = $scope.event || {
                title: '',
                guestLists: []
            };

            $scope.$watch('event', function (newVal) {
                if (!newVal) {
                    return;
                }

                $scope.inviteSuffix = (new Date()).getTime();
            })


            $scope.getEventInvite = function () {
                return eventsService.getEventInvite('300px', $scope.event.id, $scope.inviteSuffix);
            };


            $scope.onInviteSelected = function (files) {
                if (!files || files.length === 0) {
                    return;
                }
                $scope.upload(files[0]);
            };


            $scope.upload = function (files) {
                $scope.fetchingData = true;
                uploaderService.uploadEventInvite(files, $scope.event.id).then(function () {
                        alert('image was saved!');
                    },
                    function (err) {
                        dialogService.error("There was a problem saving your image please try again");
                    }
                ).finally(
                    function () {
                        $scope.fetchingData = false;
                    }
                )
            };


            $scope.onAddGLClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;

                scope.selected = angular.copy($scope.event.guestLists);

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
                            dialogService.success('Event ' + res.title + ' created');

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

            $scope.onFinishClicked = function () {
                $state.go('main.event_summary', {eventId: $scope.event.id});
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
