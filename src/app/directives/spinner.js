angular.module('gliist')
    .directive('spinner', [function () {
        'use strict';

        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                min: '@',
                max: '@',
                nullable: '@',
                ngModel: '=',
                change: '&'
            },
            replace: true,
            templateUrl: 'app/templates/spinner.tmpl.html',
            controller: ['$scope', function($scope) {
                var nullable = !!$scope.nullable;
                var min = parseNumber($scope.min, 0);
                var max = parseNumber($scope.max, 365);

                $scope.ngModel = parseNumber($scope.ngModel, nullable ? null : 0);

                $scope.validate = function() {
                    var defValue = nullable ? '' : min;
                    $scope.ngModel = parseNumber($scope.ngModel, defValue);
                    if ($scope.ngModel === null) {
                        return;
                    }
                    $scope.ngModel = $scope.ngModel < min ? min : $scope.ngModel;
                    $scope.ngModel = $scope.ngModel > max ? max : $scope.ngModel;
                    $scope.change();
                };

                $scope.$watch('ngModel', function (newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $scope.change();
                    }
                });

                $scope.validate();

                $scope.minus = function() {
                    $scope.ngModel = parseNumber($scope.ngModel, min);
                    if ($scope.ngModel > min) {
                        $scope.ngModel--;
                    }
                };

                $scope.plus = function() {
                    $scope.ngModel = parseNumber($scope.ngModel, min-1);
                    if ($scope.ngModel < max) {
                        $scope.ngModel++;
                    }
                };
                
                function parseNumber(value, defaultValue) {
                    defaultValue = angular.isNumber(defaultValue) ? defaultValue : null;
                    value = parseInt(value);
                    return !isNaN(value) ? value : defaultValue;
                }
            }]
        };
    }]);