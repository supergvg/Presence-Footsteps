'use strict';

(function() {
  function OfflineReportService ($http) {
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
    '$http'
  ];

  angular.module('gliist').factory('offlineReportService', OfflineReportService);
})();

