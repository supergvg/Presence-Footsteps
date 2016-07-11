'use strict';

angular.module('gliist')
    .directive('alignmentHeight', [function () {
        return {
            restrict: 'A',
            link: function($scope, element) {
                $scope.$watch(function(){
                    return element[0].children.length;
                }, function(newVal) {
                    if (newVal > 0) {
                        var watcher =   $scope.$watchCollection(function(){
                                            var heights = [];
                                            for (var i = 0; i < element[0].children.length; i++) {
                                                heights.push(element[0].children[i].clientHeight);
                                            }
                                            return heights;
                                        }, function(newVal){
                                            var maxHeight = 0;
                                            angular.forEach(newVal, function(height){
                                                if (height > maxHeight) {
                                                    maxHeight = height;
                                                }
                                            });
                                            var tariffs = angular.element(element[0]).find('.tariff-block');
                                            if (tariffs.length > 0) {
                                                var headerHeight = angular.element(tariffs[0]).find('.tariff-header'),
                                                    footerHeight = angular.element(tariffs[0]).find('.tariff-footer');
                                                if (headerHeight.length > 0 && footerHeight.length > 0) {
                                                    watcher();
                                                    angular.forEach(tariffs, function(tariff){
                                                        angular.element(tariff).find('.tariff-content').css('min-height', (maxHeight - headerHeight[0].clientHeight - footerHeight[0].clientHeight) + 'px');
                                                    });
                                                }
                                            }
                                        });
                    }
                });
            }    
        };
    }]);