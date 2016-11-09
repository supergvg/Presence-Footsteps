'use strict';

angular.module('gliist')
  .filter('replaceUnderscores', function() {
     return function(input) {
         return input.replace(/_/g, ' ');
     }
  });