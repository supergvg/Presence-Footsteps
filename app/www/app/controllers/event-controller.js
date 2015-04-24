angular.module('starter').controller('eventController',
    ['$scope', '$rootScope', 'eventsService', '$stateParams', 'dialogService', '$cordovaBarcodeScanner',
        function ($scope, $rootScope, eventsService, $stateParams, dialogService, $cordovaBarcodeScanner) {


            $scope.title = 'Event';

            $scope.currentUser = $rootScope.currentUser;

            $scope.scanBarcode = function () {
                $cordovaBarcodeScanner
                    .scan()
                    .then(function (barcodeData) {
                        alert(JSON.stringfy(barcodeData));
                    }, function (error) {
                        // An error occurred
                    });

            };

            $scope.initGuestListView = function () {
                var eventId = $stateParams.eventId;

                eventsService.getEvents(eventId).then(
                    function (event) {
                        $scope.currentEvent = event;
                    },
                    function () {
                        dialogService.error('Oops there was a problem getting event, please try again')
                    }
                );
            };


            $scope.init = function () {

                $scope.eventId = $stateParams.eventId;

                eventsService.getEvents($scope.eventId).then(
                    function (event) {
                        $scope.currentEvent = event;

                        if ($scope.currentEvent.guestLists[0]) {
                            $scope.guests = $scope.currentEvent.guestLists[0];
                        }
                    },
                    function () {
                        dialogService.error('Oops there was a problem getting event, please try again')
                    }
                );

            };
        }

    ]);
