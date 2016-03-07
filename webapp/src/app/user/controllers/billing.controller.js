'use strict';

angular.module('gliist')
    .controller('BillingCtrl', ['$scope', '$mdDialog',
        function($scope, $mdDialog) {
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
            
            $scope.squareDialog = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/square-dialog.html'
                });  
            };
            
            $scope.invoiceDetails = function() {
                var scope = $scope.$new();
                scope.close = function() {
                    $mdDialog.hide();
                };
                $mdDialog.show({
                    scope: scope,
                    templateUrl: 'app/user/templates/invoice-details.html'
                });  
            };
        }]);
