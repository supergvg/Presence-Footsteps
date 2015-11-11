angular.module('starter').controller('addGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope', '$ionicLoading',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope, $ionicLoading) {

        $scope.currentGuest = {};
        $scope.guests = {};

        $scope.active = 'single';
        $scope.setActive = function (activeScreen) {
            $scope.active = activeScreen;
            $scope.addMore = false;
            $scope.errorMessage = '';
        };

        $scope.isActive = function (activeScreen) {
            if ($scope.active === activeScreen) {
                return {
                    'background-color': '#9FCBFF',
                    'color': 'white'
                }
            }
        };

        $scope.onAddMoreClicked = function () {
            $scope.currentGuest = {};
            $scope.guests = {};
            $scope.addMore = false;
        };

        $scope.formInvalid = function () {
            return (!$scope.currentGuest.firstName || !$scope.currentGuest.lastName);
        };


        $scope.onAddMultipleClicked = function () {

            if (!$scope.guests.names) {
                $scope.errorMessage = "Please enter guests names separated with commas";
                return;
            }

            $scope.errorMessage = null;
            $scope.fecthingData = true;

            eventsService.addGuestsToEvent($scope.guests, $scope.currentEvent.id).then(
                function () {
                    $scope.addMore = true;
                    dialogService.success('Guests added');
                },
                function () {
                    dialogService.error('Oops there was a problem adding guest, please try again');
                }
            ).finally(function () {
                    $scope.fecthingData = false;
                });
        };

        $scope.onAddMoreMultipleClicked = function () {
            $scope.currentGuest = {};
            $scope.guests = {};
            $scope.addMore = false;
        };

        $scope.onAddClicked = function () {

            if ($scope.formInvalid()) {
                $scope.errorMessage = "Please Fill First and Last Name";
                return;
            }
            $scope.errorMessage = null;

            $scope.fecthingData = true;
            eventsService.addGuestToEvent($scope.currentGuest, $scope.currentEvent.id).then(
                function () {
                    $scope.addMore = true;
                    dialogService.success('Guest added');

                },
                function () {
                    dialogService.error('Oops there was a problem adding guest, please try again');
                }
            ).finally(function () {
                    $scope.fecthingData = false;
                });
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
