'use strict';

angular.module('gliist')
  .directive('passwordMatches', [function () {
    return {
      restrict: 'E',
      scope: {
        password: '='
      },
      templateUrl: 'app/templates/password-matches.html',
      link: function(scope, element, attrs, ctrl) {
        scope.$watch('password', function (val) {
          val = val || '';
          scope.minLength = parseInt(attrs.minLength, 10) || 0;
          scope.passwordMatches = {
            number: /\d/.test(val),
            special: /[-[\]{}()*+?.,\\^$|#!@%&]/.test(val),
            length: val.length >= scope.minLength
          }
        });
      }
    };
  }]);
