'use strict';

angular.module('gliist').factory('dateService', [
  '$filter',
  function ($filter) {
    return {
      utc: function( date ) {
        if (!date || !angular.isDate(date)) {
          return date;
        }

        // Transform timezone offset from +0200 to +02:00
        return $filter('date')(date, 'yyyy-MM-ddTHH:mm:ssZ').replace(/(\d{2})$/, ':$1');
      }
    };
  }
]);
