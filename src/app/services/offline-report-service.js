'use strict';

(function() {
  function OfflineReportService ($http, $q) {
    return {
      getStats: function (eventId) {
        // FIXME: temporary solution until server starts sending data
        return $q.resolve([
          {
            guestName: 'Alice',
            type: 'VIP',
            list: "Alice's List",
            reason: 'Guest Not Found',
            guestExceeded: 0,
            userName: 'Jocelyn'
          },
          {
            guestName: 'Tim',
            type: 'Guest',
            list: "Jocelyn's List",
            reason: 'Guest List Exceeded',
            guestExceeded: 3,
            userName: 'Jocelyn'
          },
          {
            guestName: 'Bill',
            type: 'Guest',
            list: "Alice's List",
            reason: 'Double checked-in',
            guestExceeded: 0,
            userName: 'Jocelyn'
          },
          {
            guestName: 'Cathy',
            type: 'Guest',
            list: "Alice's List",
            reason: 'Double checked-in',
            guestExceeded: 0,
            userName: 'Jocelyn'
          },
          {
            guestName: 'Tony',
            type: 'VIP',
            list: "Jocelyn's List",
            reason: 'Guest List Exceeded',
            guestExceeded: 2,
            userName: 'Jocelyn'
          }
        ]);
        return $http.get('api/OfflineModeController/GetStats/' + eventId);
      },

      getReport: function (eventId) {
        return $http.get('api/OfflineModeController/GetReport/' + eventId);
      }
    };
  }

  OfflineReportService.$inject = [
    '$http',
    '$q'
  ];

  angular.module('gliist').factory('offlineReportService', OfflineReportService);
})();

