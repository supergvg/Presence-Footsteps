angular.module('starter').controller('addGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope', '$ionicLoading',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope, $ionicLoading) {
        $scope.currentGuest = {};


        $scope.onAddMoreClicked = function () {
            $scope.currentGuest = {};
            $scope.addMore = false;
        };

        $scope.onAddClicked = function () {
            eventsService.addGuestToEvent($scope.currentGuest, $scope.currentEvent.id).then(
                function () {
                    $scope.addMore = true;
                    dialogService.success('Guest added');

                },
                function () {
                    dialogService.error('Oops there was a problem adding guest, please try again');
                }
            )
        };

        $scope.init = function () {

            var eventId = $stateParams.eventId;

            $scope.currentGuest = {};
            $scope.addMore = false;

            if (!eventId) {
                $state.go('app.home');
                return;
            }

            $ionicLoading.show({
                template: 'Loading...'
            });

            eventsService.getEvents(eventId).then(
                function (event) {
                    $scope.currentEvent = event;

                },
                function () {
                    dialogService.error('Oops there was a problem getting event, please try again')
                }
            ).finally(function () {
                    $ionicLoading.hide();
                });

        };
    }
]);
