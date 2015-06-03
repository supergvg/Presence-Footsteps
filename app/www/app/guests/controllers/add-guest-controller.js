angular.module('starter').controller('addGuestController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state', '$rootScope', '$ionicLoading',

    function ($scope, $stateParams, eventsService, dialogService, $state, $rootScope, $ionicLoading) {
        $scope.currentGuest = {};


        $scope.onAddMoreClicked = function () {
            $scope.currentGuest = {};
            $scope.addMore = false;
        };

        $scope.formInvalid = function () {
            return (!$scope.currentGuest.firstName || !$scope.currentGuest.lastName);
        };

        $scope.onAddClicked = function () {

            if ($scope.formInvalid()) {
                $scope.errorMessage = "Please Fill All Fields";
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
