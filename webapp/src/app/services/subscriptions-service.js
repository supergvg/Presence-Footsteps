'use strict';

angular.module('gliist').factory('subscriptionsService', ['$http', '$q', 'dialogService',
    function ($http, $q, dialogService) {
        return {
            getAllSubscriptions: function() {
                var d = $q.defer();
                $http({
                    method: 'GET',
                    url: 'api/subscriptions'
                }).success(function(data) {
                    d.resolve(data);
                }).error(function() {
                    dialogService.error('Oops there was an error trying to get guest information, please try again');
                    d.reject();
                });
                return d.promise;                
            }
        };
    }]);