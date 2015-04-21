'use strict';

angular.module('gliist')
    .controller('GuestListCtrl', ['$scope', 'guestFactory', 'dialogService', '$mdDialog', '$http', 'uploaderService',
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

            $scope.glistSelected = function (glist) {

                return _.find($scope.selected, function (item) {
                    return glist.id === item.id;
                });
            };
            $scope.toggleSelected = function (item) {
                var idx = $scope.selected.indexOf(item);
                if (idx > -1) {
                    $scope.selected.splice(idx, 1)
                } else {
                    $scope.selected.push(item);
                }
            };

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
