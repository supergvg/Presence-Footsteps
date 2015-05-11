angular.module('starter').controller('EventPreviewController', ['$scope', '$stateParams', 'eventsService', 'dialogService', '$state',

    function ($scope, $stateParams, eventsService, dialogService, $state) {


        $scope.getEventInvite = function (event) {
            if (!event) {
                return;
            }

            return {
                'background-image': "url(" + event.invitePicture + ")",
                'background-position': 'center center',
                'height': '100%',
                'background-size': 'cover'
            };
        };
    }
]);
