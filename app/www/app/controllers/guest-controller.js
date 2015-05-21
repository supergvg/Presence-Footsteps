angular.module('starter').controller('guestController', ['$scope', '$stateParams', 'eventsService', 'dialogService',

    function ($scope, $stateParams, eventsService, dialogService) {
        $scope.init = function () {

            var guestListId = $stateParams.guestListId,
                guestId = $stateParams.guestId;


            eventsService.getGuestInfo(guestListId, guestId).then(
                function (guest) {
                    $scope.currentGuest = guest;
                },
                function () {
                    dialogService.error('Oops there was a problem getting guest, please try again')
                }
            );
        };
    }
]);
