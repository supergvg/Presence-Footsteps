'use strict';

angular.module('gliist')
    .controller('GuestListEditorCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService',
        function ($scope, guestFactory, dialogService, $mdDialog, $http, uploaderService) {

            $scope.guestListTypes = [
                'GA',
                'VIP',
                'Guest',
                'Artist',
                'Production',
                'Staff',
                'Press'

            ];

            $scope.guests = [];

            $scope.selected = $scope.selected || [];


            $scope.addMore = function () {
                $scope.list.guests.push({
                });
            };

            $scope.save = function () {
                $scope.fetchingData = true;
                guestFactory.GuestList.update($scope.list).$promise.then(
                    function (res) {
                        $scope.list.id = res.id;
                        dialogService.success('Event created: ' + JSON.stringify(res));

                        if ($scope.onSave) {
                            $scope.onSave(res);
                        }

                    }, function () {
                        dialogService.error('There was a problem saving your event, please try again');
                    }).finally(function () {
                        $scope.fetchingData = false;
                    })
            };

            $scope.init = function () {

                if (!$scope.list) {
                    $scope.list = {
                        guests: [
                        ]
                    };
                }

                if (!$scope.options) {
                    $scope.options = {};
                }

            };

            $scope.init();

        }]);
