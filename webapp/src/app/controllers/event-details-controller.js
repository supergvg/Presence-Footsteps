angular.module('gliist')
    .controller('EventDetailsController', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {
            'use strict';

            function mergeGuestList(parent, merge) {
                parent.guests = parent.guests.concat(merge.guests); //TODO need to ignore merges
            }

            $scope.data = {
                selectedIndex: 2
            };

            $scope.glmOptions = {
                hideManualImport: true
            }

            $scope.event = $scope.event || {
                title: 'fake'
            };


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
                eventsService.createEvent($scope.event).then(
                    function (res) {
                        dialogService.success('Event created: ' + JSON.stringify(res));

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }
                )
            };

        }]);
