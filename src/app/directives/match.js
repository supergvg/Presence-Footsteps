angular.module('gliist')
    .directive('ngMatch', [function () {
        'use strict';
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, ctrl) {
                var checker = function () {
                    //get the value of the first password
                    var e1 = scope.$eval(attrs.ngModel); 
                    //get the value of the other password  
                    var e2 = scope.$eval(attrs.ngMatch);
                    return e1 === e2;
                };
                scope.$watch(checker, function (n) {
                    //set the form control to valid if both 
                    //passwords are the same, else invalid
                    ctrl.$setValidity('match', n);
                });
            }
        };
    }]);