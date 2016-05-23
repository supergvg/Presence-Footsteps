'use strict';

angular.module('gliist')
    .controller('EditGuestListCtrl', ['$scope', '$stateParams', 'guestFactory', 'dialogService', '$state',
        function ($scope, $stateParams, guestFactory, dialogService, $state) {
            var listId = $stateParams.listId;
            $scope.fetchingData = true;

            guestFactory.GuestList.get({id: listId}).$promise.then(
                function(res) {
                    $scope.list = res;
                }, function() {
                    $state.go('main.list_management');
                    dialogService.error('There was a problem reading guest list, please try again');
                }
            ).finally(function() {
                $scope.fetchingData = false;
            });
        }
    ]);
