'use strict';

angular.module('gliist')
    .controller('EventSummaryCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$mdDialog',
        function ($scope, $stateParams, dialogService, $state, eventsService, $mdDialog) {


            $scope.init = function () {
                $scope.eventId = $stateParams.eventId;
            };
        }]);
