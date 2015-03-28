'use strict';

angular.module('gliist')
    .controller('GuestListCtrl', ['$scope', 'guestFactory', 'dialogService',
        function ($scope, guestFactory, dialogService) {


            $scope.guests = [];

            $scope.addMore = function () {
                $scope.list.guests.push({
                });
            };

            $scope.save = function () {
                guestFactory.GuestList.update($scope.list).$promise.then(function (res) {
                    dialogService.success('Event created: ' + JSON.stringify(res));

                }, function () {
                    dialogService.error('There was a problem saving your event, please try again');

                })
            };


            $scope.init = function () {

                if (!$scope.list) {
                    $scope.list = {
                        title: 'bla lba',
                        guests: [
                            {
                                firstName: 'eran',
                                lastName: 'kaufman',
                                email: 'erank3@gmafd.com'}
                        ]
                    }
                }

            };

            $scope.init();


        }])
;
