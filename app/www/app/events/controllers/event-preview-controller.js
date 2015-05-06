angular.module('starter').controller('EventPreviewController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {


        $scope.getEventInvite = function (event) {
            if (!event) {
                return;
            }
            return eventsService.getEventInvite('100%', event.id, $scope.inviteSuffix);
        };
    }
]);