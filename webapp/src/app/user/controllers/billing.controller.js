'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope',
        function($scope) {
            $scope.invoices = [
                {
                    date: '01/26/2016',
                    amount: '12$'
                },
                {
                    date: '01/26/2016',
                    amount: '12$'
                }
            ];
        }]);
