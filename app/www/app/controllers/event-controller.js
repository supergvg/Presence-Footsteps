angular.module('starter').controller('eventController',
    ['$scope', '$rootScope', 'eventsService', '$stateParams', 'dialogService', '$cordovaBarcodeScanner', '$ionicLoading', '$ionicPopup', '$state',
        function ($scope, $rootScope, eventsService, $stateParams, dialogService, $cordovaBarcodeScanner, $ionicLoading, ionicPopup, $state) {

            $rootScope.title = 'Event';

            $scope.scanBarcode = function () {
                $cordovaBarcodeScanner
                    .scan()
                    .then(function (barcodeData) {
                        var data = barcodeData.text.split(',');

                        if (data.length !== 3) {
                            return ionicPopup.alert({
                                title: 'Error',
                                template: 'QR code is invalid'
                            });
                        }
                        if (data[0] != $scope.currentEvent.id) {
                            return ionicPopup.alert({
                                title: 'Error',
                                template: 'Wrong event'
                            });
                        }

                        $state.go('app.check_guest', {gliId: data[1], guestId: data[2]});

                    }, function (error) {
                        ionicPopup.alert({
                            title: 'Error',
                            template: 'Reading QR code failed, please try again'
                        });
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
