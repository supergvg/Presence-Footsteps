'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', 'eventsService', 'dialogService', '$stateParams', '$state', '$window',
        function ($scope, eventsService, dialogService, $stateParams, $state, $window) {
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
            $scope.rsvp = [
                {name: 'Invited', color: '#cef0f2', total: 0},
                {name: 'RSVP', color: '#f7f9c3', total: 0},
                {name: 'RSVP checked in', color: '#ffd8b4', total: 0}
            ];
            $scope.Math = $window.Math;
            $scope.gliOptions = {
                readOnly: true,
                stats: true
            };
            $scope.stats = {};
            $scope.totalCheckedIn = 0;
            $scope.eventType = 1;

            $scope.calculateStats = function() {
                if (!$scope.event) {
                    return;
                }
                var category = '';
                angular.forEach($scope.event.guestLists, function(gl) {
                    category = gl.listType.toLowerCase();
                    if (!$scope.stats[category]) {
                        $scope.stats[category] = {
                            totalCheckedIn: 0,
                            total: 0
                        };
                    }
                    angular.forEach(gl.actual, function(guest) {
                        if (guest.status === 'checked in') {
                            $scope.stats[category].totalCheckedIn += guest.guest.plus + 1 - guest.plus;
                        }
                    });
                    $scope.stats[category].total += gl.guestsCount;
                    $scope.totalCheckedIn += $scope.stats[category].totalCheckedIn;
                    
                    //RSVP stats
                    if (gl.instanceType === 2 && gl.published) {
                        $scope.rsvp[0].total += gl.guestsCount;
                        $scope.rsvp[1].total += gl.actual.length;
                        $scope.rsvp[2].total = $scope.stats[category].totalCheckedIn;
                    }
                    if (gl.instanceType === 4) {
                        $scope.rsvp[1].total += gl.guestsCount;
                        $scope.rsvp[2].total = $scope.stats[category].totalCheckedIn;
                    }
                });
                $scope.updateChart();
            };
            
            $scope.getCategoryStats = function(category) {
                return $scope.stats[category.toLowerCase()] || {totalCheckedIn: 0, total: 0};
            };
            
            $scope.updateChart = function() {
                $scope.chartObject = {
                    type: 'PieChart',
                    options: {
                        titlePosition: 'none',
                        legend: 'none',
                        colors: $scope.categories.map(function(category){
                            return category.color;
                        }),
                        chartArea: {left: 0, top: '5%', width: '100%', height: '90%'},
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
                    $scope.chartObject.data.rows.push({
                        c: [{v: category.name}, {v: $scope.getCategoryStats(category.name).totalCheckedIn}]
                    });
                });
                
                $scope.rsvp.sort(function(a, b){
                    if (a.total > b.total) {
                        return 1;
                    }
                    if (a.total < b.total) {
                        return -1;
                    }
                });
                var names = [''],
                    totals = [''];
                $scope.rsvp.forEach(function(item, i, arr){
                    names.push(item.name);
                    names.push({role: 'tooltip'});
                    if (i > 0) {
                        totals.push(arr[i].total - arr[i - 1].total);
                    } else {
                        totals.push(item.total);
                    }
                    totals.push(item.name+': '+item.total);
                });
                $scope.chartObjectRSVP = {
                    type: 'ColumnChart',
                    options: {
                        legend: 'none',
                        colors: $scope.rsvp.map(function(item){ return item.color; }),
                        chartArea: {left: '5%', top: '5%', width: '100%', height: '90%'},
                        bar: { groupWidth: '20%' },
                        isStacked: true,
                        vAxis: {gridlines: {count: 3}, viewWindow: {max: $scope.rsvp[$scope.rsvp.length - 1].total}}
                    },
                    data: [names, totals]
                };
            };

            $scope.init = function() {
                var eventId = $stateParams.eventId;
                $scope.initializing = true;
                eventsService.getEvents(eventId).then(
                    function(data) {
                        $scope.event = data;
                        $scope.eventType = $scope.event.type;
                        $scope.calculateStats();
                    }, function() {
                        dialogService.error('There was a problem getting your events, please try again');
                        $state.go('main.current_events');
                    }
                ).finally(function() {
                    $scope.initializing = false;
                });
            };
        }]);