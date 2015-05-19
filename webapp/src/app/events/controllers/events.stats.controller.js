'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$stateParams',
        function ($scope, $mdDialog, eventsService, dialogService, $stateParams) {


            $scope.cssStyle = "height:500px; width:100%;";

            $scope.updateChart = function (event) {
                $scope.chartObject = {
                    type: 'PieChart',
                    options: {
                        title: ''
                    },
                    colors: ['#A6C6AF', '#ECECEC', '#ec8f6e', '#f3b49f', '#f6c7b6'],
                    data: {
                        cols: [
                            {id: "t", label: "Topping", type: "string"},
                            {id: "s", label: "Slices", type: "number"}
                        ],
                        rows: []
                    }
                };
                angular.forEach(event.guestLists, function (gl) {
                    $scope.chartObject.data.rows.push({
                        c: [
                            {
                                v: gl.listType
                            },
                            {
                                v: gl.actual.length
                            }
                        ]
                    });
                });

            };

            $scope.$watch('event', function (newValue) {
                if (!newValue) {
                    return;
                }

                $scope.updateChart(newValue);
            });

            $scope.init = function () {

                var eventId = $stateParams.eventId;

                $scope.initializing = true;

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;

                    $scope.chips = {
                        tags: [
                            $scope.event.category
                        ],
                        readonly: true
                    };


                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');

                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                )


            };

        }]);
