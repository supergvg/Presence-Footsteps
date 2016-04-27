'use strict';

angular.module('gliist')
    .controller('EditEventCtrl', ['$scope', '$stateParams', 'dialogService', '$state', 'eventsService', '$filter', '$rootScope',
        function ($scope, $stateParams, dialogService, $state, eventsService, $filter, $rootScope) {

            $scope.isStaff = function () {
                return $rootScope.isStaff();
            };

            $scope.isPromoter = function () {
                return $rootScope.isPromoter();
            };

            $scope.init = function () {
                var eventId = $stateParams.eventId;

                $scope.initializing = true;

                $scope.currentEvents = eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;

                    $scope.event.date = moment(data.date).toDate();
                    $scope.event.time = new Date($filter('ignoreTimeZone')(data.time));
                    $scope.event.endTime = new Date($filter('ignoreTimeZone')(data.endTime));
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');

                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                );

            };

            $scope.init();

        }]);
