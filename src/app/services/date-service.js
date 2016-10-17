'use strict';

angular.module('gliist').factory('dateService', [
  '$filter',
  function ($filter) {
    return {
      utc: function( date ) {
        // Transform timezone offset from +0200 to +02:00
        return date && $filter('date')(date, 'yyyy-MM-ddTHH:mm:ssZ').replace(/(\d{2})$/, ':$1');
      }
    };
  }
]);
