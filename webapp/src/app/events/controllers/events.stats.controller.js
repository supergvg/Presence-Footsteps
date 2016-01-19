'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', 'eventsService', 'dialogService', '$stateParams', '$state',
        function ($scope, eventsService, dialogService, $stateParams, $state) {

            $scope.categories = [
                {name: 'GA', color: '#d4e4f9'},
                {name: 'VIP', color: '#cef0f2'},
                {name: 'Super VIP', color: '#cfefdc'},
                {name: 'Guest', color: '#f7f9c3'},
                {name: 'Artist', color: '#ffd8b4'},
                {name: 'Production', color: '#ead5e1'},
                {name: 'Comp', color: '#f3d4f9'},
                {name: 'All Access', color: '#c9badb'},
                {name: 'Press', color: '#e0e0e0'},
                {name: 'RSVP', color: '#eae3da'}
            ];

            $scope.getCategoryStatus = function (category) {
                var count = 0;
                if (!$scope.event) {
                    return;
                }
                angular.forEach($scope.event.guestLists, function(gl) {
                    angular.forEach(gl.actual, function(chkn) {
                        if (chkn.status !== 'checked in') {
                          return;
                        }
                        if (chkn.guest.type === category.name) {
                            count += chkn.guest.plus + 1 - chkn.plus;
                        } else if (gl.listType === category.name) {
                            count += chkn.guest.plus + 1 - chkn.plus;
                        }
                    });
                });

                return count;
            };

            $scope.Math = window.Math;

            $scope.getCategoryTotal = function (category) {
                var count = 0;
                if (!$scope.event) {
                    return;
                }
                angular.forEach($scope.event.guestLists, function(gl) {
                    angular.forEach(gl.actual, function(guest_info) {
                        if (gl.listType === 'On the spot' && guest_info.guest.type === category.name) {
                            count += guest_info.guest.plus + 1;
                        } else if (gl.listType === category.name) {
                            count += guest_info.guest.plus + 1;
                        }
                    });
                });

                return count;
            };

            $scope.updateChart = function() {
                var totalGuests = 0;
                $scope.chartObject = {
                    type: 'PieChart',
                    options: {
                        titlePosition: 'none',
                        legend: 'none',
                        colors: [
                            '#d4e4f9',
                            '#cef0f2',
                            '#cfefdc',
                            '#f7f9c3',
                            '#ffd8b4',
                            '#ead5e1',
                            '#f3d4f9',
                            '#c9badb',
                            '#e0e0e0',
                            '#eae3da'],
                        chartArea: {left: 0, top: '10%', width: '100%', height: '75%'},
                        pieSliceText: 'label'
                    },
                    data: {
                        cols: [
                            {id: 't', label: 'Topping', type: 'string'},
                            {id: 's', label: 'Slices', type: 'number'}
                        ],
                        rows: []
                    }
                };

                angular.forEach($scope.categories, function(category) {
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
                
                $scope.totalGuests = totalGuests;
            };

            $scope.$watch('event', function (newValue) {
                if (!newValue) {
                    return;
                }
                $scope.updateChart(newValue);
            });

            $scope.gliOptions = {
                readOnly: true,
                stats: true
            };

            $scope.event = {id: 0};
            $scope.init = function () {
                var eventId = $stateParams.eventId;
                $scope.initializing = true;
                eventsService.getEvents(eventId).then(function (data) {
                    $scope.event = data;
                }, function () {
                    dialogService.error('There was a problem getting your events, please try again');
                    $state.go('main.current_events');
                }).finally(
                    function () {
                        $scope.initializing = false;
                    }
                );
            };
        }]);
