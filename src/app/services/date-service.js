'use strict';

angular.module('gliist').factory('dateService', [
  '$filter',
  function ($filter) {
    return {
      utc: function( date ) {
        // Transform timezone offset from +0200 to +02:00
        if (!date) {
          return date;
        }

        var str = angular.isString(date) ? date : $filter('date')(date, 'yyyy-MM-ddTHH:mm:ssZ');
        return str.replace(/(\d{2})$/, ':$1');
      }
    };
  }
]);
