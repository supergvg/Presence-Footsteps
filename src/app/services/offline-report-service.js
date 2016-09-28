'use strict';

(function() {
  function OfflineReportService ($http, $q) {
    return {
      getStats: function (eventId) {
        return $http.get('api/OfflineMode/Stats/' + eventId);
      },

      getReport: function (eventId) {
        return $http.get('api/OfflineMode/Report/' + eventId);
      }
    };
  }

  OfflineReportService.$inject = [
    '$http',
    '$q'
  ];

  angular.module('gliist').factory('offlineReportService', OfflineReportService);
})();

