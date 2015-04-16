'use strict';

angular.module('gliist')
    .controller('EventsStatsCtrl', ['$scope', '$mdDialog', 'eventsService', 'dialogService',
        function ($scope, $mdDialog, eventsService, dialogService) {


            $scope.chartObject = {};
            $scope.cssStyle = "height:500px; width:100%;";

            $scope.chartObject.data = {"cols": [
                {id: "t", label: "Topping", type: "string"},
                {id: "s", label: "Slices", type: "number"}
            ], "rows": [
                {c: [
                    {v: "VIP"},
                    {v: 3},
                ]},
                {c: [
                    {v: "Press"},
                    {v: 3},
                ]},
                {c: [
                    {v: "GA"},
                    {v: 31}
                ]},
                {c: [
                    {v: "Artist"},
                    {v: 1},
                ]},
                {c: [
                    {v: "Production"},
                    {v: 2},
                ]}
            ]};


            // $routeParams.chartType == BarChart or PieChart or ColumnChart...
            $scope.chartObject.type = 'PieChart';
            $scope.chartObject.options = {
                'title': ''
            }

        }]);
