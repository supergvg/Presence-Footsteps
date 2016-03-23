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
                    data.sort(function(a, b){
                        if (a.displaySequence > b.displaySequence) {
                            return 1;
                        }
                        if (a.displaySequence < b.displaySequence) {
                            return -1;
                        }
                    });
                    var combinedPlanWith = {};
                    data.forEach(function(item, i, arr){
                        if (item.combinedThisPlanWith) {
                            if (!combinedPlanWith[item.combinedThisPlanWith]) {
                                combinedPlanWith[item.combinedThisPlanWith] = {options: [], model: item.combinedThisPlanWith};
                            }
                            combinedPlanWith[item.combinedThisPlanWith].options.push(item);
                        }
                        arr[i].feature.sort(function(a, b){
                            if (a.DisplaySequence > b.DisplaySequence) {
                                return 1;
                            }
                            if (a.DisplaySequence < b.DisplaySequence) {
                                return -1;
                            }
                        });
                    });
                    d.resolve({plans: data, combinedPlanWith: combinedPlanWith});
                }).error(function() {
                    dialogService.error('Oops there was an error trying to get guest information, please try again');
                    d.reject();
                });
                return d.promise;                
            }
        };
    }]);