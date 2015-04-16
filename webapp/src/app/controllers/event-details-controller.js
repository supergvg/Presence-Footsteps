angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {
            'use strict';

            function mergeGuestList(parent, merge) {
                parent.guests = parent.guests.concat(merge.guests); //TODO need to ignore merges
            }

            $scope.eventCategories = [
                'Food & Drinks',
                'Concert/Show Case',
                'Camp/Trip/Retreat',
                'Class/Training/Workshop/Seminar',
                'Conference (Tech, finance, art, fashion, Gaming, women, men, recreation, or enter the type of conference)',
                'Convention',
                'Festival (enter the type)',
                'Gala',
                'Game/Competition',
                'Networking Event  (Tech, finance, art, fashion, Gaming, women, men, recreation, or enter the type of conference)',
                'Party (birthday, celebration, engagement, retiring)',
                'Screening',
                'Tournament (please enter the type of tournament)',
                'tradeshow/Expo (please enter the type)',
            ];

            $scope.data = {
                selectedIndex: 2
            };

            $scope.glmOptions = {
                hideManualImport: true
            }

            $scope.event = $scope.event || {
                title: '',
                guestLists: []
            };


            $scope.onAddClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = [];

                scope.importGLists = function () {
                    angular.forEach(scope.selected, function (gl) {
                            mergeGuestList($scope.event.guestList, gl);
                        }
                    );
                    $mdDialog.hide();
                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };


                $mdDialog.show({
                    controller: 'LinkGuestListCtrl',
                    scope: scope,
                    templateUrl: 'app/templates/events/link-guest-list-dialog.tmpl.html',
                    targetEvent: ev
                });
            }


            $scope.onLinkClicked = function (ev) {
                var scope = $scope.$new();
                scope.currentGlist = $scope.event;
                scope.cancel = $scope.cancel;
                scope.save = $scope.save;
                scope.selected = [];

                scope.importGLists = function () {
                    angular.forEach(scope.selected, function (gl) {
                            mergeGuestList($scope.event.guestList, gl);
                        }
                    );
                    $mdDialog.hide();
                };

                scope.cancel = function () {
                    $mdDialog.hide();
                };


                $mdDialog.show({
                    //controller: DialogController,
                    scope: scope,
                    templateUrl: 'app/templates/list/glist-import-dialog.html',
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

                $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 2);
            };
            $scope.previous = function () {
                $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
            };


            $scope.createEvent = function () {
                $scope.savingEvent = true;
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        dialogService.success('Event created: ' + JSON.stringify(res));

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
