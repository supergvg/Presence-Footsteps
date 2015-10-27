'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService', '$stateParams', '$state', '$timeout',
        function ($scope, $mdDialog, eventsService, dialogService, $stateParams, $state, $timeout) {


            $scope.cssStyle = "height:400px; width:100%;";


            $scope.categories = [
                {name: 'GA', color: '#99ccff'},
                {name: 'VIP', color: '#00ffff'},
                {name: 'Guest', color: '#cc66ff'},
                {name: 'Artist', color: '#ff66ee'},
                {name: 'Production', color: '#99ccff'},
                {name: 'Comp', color: '#00ccff'},
                {name: 'Super VIP', color: '#00ccff'},
                {name: 'All Access', color: '#00ffff'},
                {name: 'Press', color: '#cc66ff'},
                {name: 'RSVP', color: '#ff66ee'}
            ];

            $scope.getCategoryStatus = function (category) {

                var count = 0;
                if (!$scope.event) {
                    return;
                }
                angular.forEach($scope.event.guestLists,
                    function (gl) {

                        angular.forEach(gl.actual,
                            function (chkn) {

                                if (chkn.status !== 'checked in') {
                                    return;
                                }

                                if (chkn.guest.type === category.name) {
                                    count += chkn.guest.plus + 1 - chkn.plus;
                                }
                                else if (gl.listType === category.name) {
                                    count += chkn.guest.plus + 1 - chkn.plus;
                                }

                            });
                    }
                );

                return count;
            };

            $scope.Math = window.Math;

            $scope.getCategoryTotal = function (category) {

                var count = 0;

                if (!$scope.event) {
                    return;
                }

                angular.forEach($scope.event.guestLists,
                    function (gl) {

                        angular.forEach(gl.actual,
                            function (guest_info) {

                                if (gl.listType === 'On the spot' && guest_info.guest.type === category.name) {
                                    count += guest_info.guest.plus + 1;
                                }
                                else if (gl.listType === category.name) {
                                    count += guest_info.guest.plus + 1;
                                }

                            });
                    }
                );

                return count;
            };

            $scope.updateChart = function (event) {

                var totalGuests = 0;

                $scope.chartObject = {
                    type: 'PieChart',
                    options: {
                        title: 'Total Checked in Guests ' + totalGuests,
                        titleTextStyle: {
                            fontSize: 14
                        },
                        backgroundColor: '#ECECEC',
                        legend: 'none',
                        colors: [
                            '#35A9A9',
                            '#3FBEE1',
                            '#42E19E',
                            '#9369E9',
                            '#EA69D0',
                            '#35A9A9',
                            '#42E19E',
                            '#9369E9',
                            '#EA69D0',
                            '#35A9A9'],
                        chartArea: {left: 0, top: '10%', width: '100%', height: '75%'},
                        pieSliceText: 'label'
                    },
                    data: {
                        cols: [
                            {id: "t", label: "Topping", type: "string"},
                            {id: "s", label: "Slices", type: "number"}
                        ],
                        rows: []
                    }
                };

                angular.forEach($scope.categories, function (category) {

                    var categoryCount = $scope.getCategoryStatus(category);

                    totalGuests += categoryCount;

                    $scope.chartObject.data.rows.push({
                        c: [
                            {
                                v: category.name
                            },
                            {
                                v: categoryCount
                            }
                        ]
                    });
                });
                $scope.chartObject.options.title = 'Total Checked in Guests ' + totalGuests;

                $timeout(function () {
                    $("text:contains(" + $scope.chartObject.options.title + ")").attr({'x': '20'});
                }, 1000);

            };

            $scope.$watch('event', function (newValue) {
                if (!newValue) {
                    return;
                }

                $scope.updateChart(newValue);
            });

            $scope.options = {
                local: true
            };

            $scope.gliOptions = {
                readOnly: true,
                stats: true
            };

            $scope.currentEvents = [];
            $scope.init = function () {

                var eventId = $stateParams.eventId;

                $scope.initializing = true;

                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;

                    $scope.currentEvents.push(data);

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
