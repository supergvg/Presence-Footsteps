'use strict';

angular.module('gliist')
    .controller('EditGuestListCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService',
        function ($scope, $stateParams, guestFactory, dialogService) {


            $scope.init = function () {
                var listId = $stateParams.listId;
                $scope.fetchingData = true;

                guestFactory.GuestList.get({id: listId}).$promise.then(
                    function (res) {
                        $scope.list = res;
                    }, function () {

                        dialogService.error('There was a problem saving your event, please try again');

                    }).finally(function () {
                        $scope.fetchingData = false;
                    })

            }

            $scope.init();

        }]);
