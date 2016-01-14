angular.module('gliist')
    .directive('currency', ['$filter', function ($filter) {
        'use strict';

        return {
            restrict: 'A',
            require: '^ngModel',
            scope: true,
            link: function(scope, el, attrs, ngModelCtrl) {
                function formatter(value) {
                    value = parseInt(value.toString().replace(/[^0-9]/g, ''));
                    if (value < 0) {
                        value = 0;
                    } else if (value > 9999) {
                        value = 9999;
                    }
                    var formattedValue = $filter('currency')(value, '', 0);
                    el.val(formattedValue);
                    return formattedValue;
                }
                ngModelCtrl.$formatters.push(formatter);
                el.bind('focus', function() {
                    el.val('');
                });
                el.bind('blur', function() {
                    formatter(el.val());
                });                
            }
        };
    }]);