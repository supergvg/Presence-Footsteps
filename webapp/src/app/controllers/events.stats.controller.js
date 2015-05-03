'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {


            $scope.cssStyle = "height:500px; width:100%;";


            $scope.init = function () {


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
                angular.forEach($scope.currentEvent.guestLists, function (gl) {
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

            $scope.init();
        }]);
