angular.module('starter').controller('eventController',
    ['$scope', '$rootScope', 'eventsService', '$stateParams', 'dialogService', '$cordovaBarcodeScanner', '$ionicLoading',
        function ($scope, $rootScope, eventsService, $stateParams, dialogService, $cordovaBarcodeScanner, $ionicLoading) {

            $rootScope.title = 'Event';

            $scope.scanBarcode = function () {
                $cordovaBarcodeScanner
                    .scan()
                    .then(function (barcodeData) {
                        alert(JSON.stringfy(barcodeData));
                    }, function (error) {
                        // An error occurred
                    });

            };

            $scope.init = function () {

                $scope.eventId = $stateParams.eventId;

                $ionicLoading.show({
                    template: 'Loading...'
                });

                eventsService.getEvents($scope.eventId).then(
                    function (event) {
                        $scope.currentEvent = event;
                        $rootScope.title = event.title;

                        $scope.guests = {
                            guests: []
                        };
                        angular.forEach($scope.currentEvent.guestLists, function (gli) {
                                if (gli.linked_guest_list) {
                                    $scope.guests.guests = $scope.guests.guests.concat(gli.linked_guest_list.guests);
                                }

                            }
                        );
                    },
                    function () {
                        dialogService.error('Oops there was a problem getting event, please try again')
                    }
                ).finally(
                    function () {
                        $ionicLoading.hide();
                    }
                );

            };
        }

    ]);
